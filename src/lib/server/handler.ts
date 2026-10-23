import 'server-only';
import { z } from 'zod';
import { publicEnv } from '@/config/env';
import { siteConfig } from '@/config/site';
import { deploymentTier, type DeploymentTier } from '@/config/tier';
import {
  getServerEnv,
  mailConfigProblems,
  parseRecipients,
  type ServerEnv,
} from '@/lib/server/env';
import { buildLeadEmail } from '@/lib/server/lead-email';
import { logEvent, type LogFn } from '@/lib/server/logger';
import { getMailProvider } from '@/lib/server/mail';
import type { MailProvider, SendResult } from '@/lib/server/mail/types';
import { isOriginAllowed } from '@/lib/server/origin';
import {
  getClientIp,
  hashClientKey,
  sharedRateLimiter,
  type RateLimiter,
} from '@/lib/server/rate-limit';
import { verifyTurnstile, type TurnstileResult } from '@/lib/server/turnstile';
import { REFERENCE_ALPHABET, firstErrorPerField } from '@/lib/validation/common';
import { createLeadSchema, type Lead } from '@/lib/validation/lead';

export const MAX_BODY_BYTES = 32_768;
export const PROVIDER_TIMEOUT_MS = 8000;

export interface LeadDeps {
  env: ServerEnv;
  tier: DeploymentTier;
  /** siteConfig.url */
  siteUrl: string;
  /** NEXT_PUBLIC_TURNSTILE_SITE_KEY */
  turnstileSiteKey: string | undefined;
  /** Null when mail is not configured (the handler answers 503). */
  provider: MailProvider | null;
  rateLimiter: RateLimiter;
  verifyTurnstile: (input: { token: string | undefined; ip: string }) => Promise<TurnstileResult>;
  now: () => Date;
  log: LogFn;
  randomBytes: (length: number) => Uint8Array;
  /** Events already logged by this instance (misconfiguration is logged once per cold start). */
  loggedOnce: Set<string>;
}

const sharedLoggedOnce = new Set<string>();

/** The real dependencies, built per request from the process environment. */
export function createLeadDeps(): LeadDeps {
  const env = getServerEnv();
  const tier = deploymentTier();
  const siteUrl = siteConfig.url;
  return {
    env,
    tier,
    siteUrl,
    turnstileSiteKey: publicEnv.turnstileSiteKey,
    provider: getMailProvider(env),
    rateLimiter: sharedRateLimiter,
    verifyTurnstile: ({ token, ip }) =>
      env.TURNSTILE_SECRET_KEY
        ? verifyTurnstile({ secret: env.TURNSTILE_SECRET_KEY, token, ip, siteUrl, tier })
        : Promise.resolve('ok'),
    now: () => new Date(),
    log: logEvent,
    randomBytes: (length) => crypto.getRandomValues(new Uint8Array(length)),
    loggedOnce: sharedLoggedOnce,
  };
}

/**
 * `IK-` plus 8 characters from the unambiguous alphabet. Rejection sampling: bytes >= 248
 * (8 * 31) are discarded so every character is equiprobable.
 */
export function generateReference(random: (length: number) => Uint8Array): string {
  let id = '';
  while (id.length < 8) {
    for (const byte of random(16)) {
      if (byte >= 248) continue;
      id += REFERENCE_ALPHABET.charAt(byte % REFERENCE_ALPHABET.length);
      if (id.length === 8) break;
    }
  }
  return `IK-${id}`;
}

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

interface FailureExtras {
  fields?: Record<string, string>;
  reference?: string;
  headers?: Record<string, string>;
}

function respond(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

function fail(status: number, code: string, message: string, extras: FailureExtras = {}): Response {
  return respond(
    status,
    {
      ok: false,
      error: {
        code,
        message,
        ...(extras.fields ? { fields: extras.fields } : {}),
        ...(extras.reference ? { reference: extras.reference } : {}),
      },
    },
    extras.headers,
  );
}

const mailto = () => `Please email ${siteConfig.email} instead.`;

type BodyResult = { ok: true; bytes: Uint8Array } | { ok: false; reason: 'too_large' };

/** Counting reader: cancels the stream the moment the running total passes the cap. */
async function readBody(request: Request, maxBytes: number): Promise<BodyResult> {
  if (!request.body) return { ok: true, bytes: new Uint8Array(0) };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return { ok: false, reason: 'too_large' };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, bytes };
}

function parseJsonObject(bytes: Uint8Array): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function logOnce(deps: LeadDeps, event: string, fields: Parameters<LogFn>[2]): void {
  if (deps.loggedOnce.has(event)) return;
  deps.loggedOnce.add(event);
  deps.log('error', event, fields);
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'unknown_error';
}

/**
 * Order: origin, content type, body size, rate limit, JSON, honeypot, zod, Turnstile, build,
 * send. The method is checked by the framework. Success is reported only after the provider
 * confirms.
 */
export async function handleLead(request: Request, deps: LeadDeps): Promise<Response> {
  try {
    return await processLead(request, deps);
  } catch (error) {
    deps.log('error', 'lead.unhandled', { status: 500, code: errorName(error) });
    return fail(
      500,
      'internal_error',
      `Something went wrong on our side. Please try again, or email ${siteConfig.email}.`,
    );
  }
}

async function processLead(request: Request, deps: LeadDeps): Promise<Response> {
  const { headers } = request;

  // 1. Origin
  const allowed = isOriginAllowed({
    origin: headers.get('origin'),
    secFetchSite: headers.get('sec-fetch-site'),
    siteUrl: deps.siteUrl,
    nodeEnv: deps.env.NODE_ENV,
    tier: deps.tier,
    vercelUrl: deps.env.VERCEL_URL,
    vercelBranchUrl: deps.env.VERCEL_BRANCH_URL,
  });
  if (!allowed) {
    deps.log('info', 'lead.origin_rejected', { status: 403 });
    return fail(403, 'origin_forbidden', 'This request was not accepted.');
  }

  // 2. Content type (parameters such as charset are ignored)
  const mediaType = (headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase();
  if (mediaType !== 'application/json') {
    return fail(415, 'unsupported_media_type', 'Send the request as application/json.');
  }

  // 3. Body size: a cheap Content-Length precheck, then a counting reader. The header may be
  // absent or wrong, so it is never trusted alone.
  const tooLarge = () =>
    fail(
      413,
      'payload_too_large',
      'That submission is too large. Please shorten it and try again.',
    );
  const declared = Number(headers.get('content-length'));
  if (
    headers.get('content-length') !== null &&
    Number.isFinite(declared) &&
    declared > MAX_BODY_BYTES
  ) {
    return tooLarge();
  }
  const body = await readBody(request, MAX_BODY_BYTES);
  if (!body.ok) return tooLarge();

  // 4. Rate limit, before the body is parsed
  const ip = getClientIp(headers);
  const limit = deps.rateLimiter.check(hashClientKey(ip));
  if (!limit.allowed) {
    deps.log('info', 'lead.rate_limited', { status: 429 });
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSec / 60));
    return fail(
      429,
      'rate_limited',
      `Too many requests. Please try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`,
      { headers: { 'Retry-After': String(limit.retryAfterSec) } },
    );
  }

  // 5. JSON
  const json = parseJsonObject(body.bytes);
  if (!json) {
    return fail(400, 'invalid_json', 'We could not read that submission. Please try again.');
  }

  // 6. Honeypot: an honest error with a working mailto, never a fake success
  const honeypot = json.hp_confirm_ref;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    deps.log('info', 'lead.spam.honeypot', { status: 400 });
    return fail(400, 'rejected', `We could not accept this submission. ${mailto()}`);
  }

  // 7. Validation (the only trusted boundary; the client reuses the same schema for UX)
  const parsed = createLeadSchema(deps.now).safeParse(json);
  if (!parsed.success) {
    return fail(400, 'validation_error', 'Please check the highlighted fields.', {
      fields: firstErrorPerField(parsed.error.issues as z.core.$ZodIssue[]),
    });
  }
  const lead: Lead = parsed.data;

  // 8. Turnstile
  const secret = deps.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    if (!deps.turnstileSiteKey) {
      logOnce(deps, 'lead.misconfigured', {
        status: 503,
        missing: ['NEXT_PUBLIC_TURNSTILE_SITE_KEY'],
      });
      return fail(
        503,
        'captcha_not_configured',
        `We can't take your message right now. ${mailto()}`,
      );
    }
    const captcha = await deps.verifyTurnstile({ token: lead.turnstileToken, ip });
    if (captcha === 'captcha_failed') {
      deps.log('info', 'lead.captcha_failed', { type: lead.type, status: 400 });
      return fail(400, 'captcha_failed', 'The spam check did not pass. Please try again.');
    }
    if (captcha === 'captcha_unavailable') {
      deps.log('warn', 'lead.captcha_unavailable', { type: lead.type, status: 503 });
      return fail(
        503,
        'captcha_unavailable',
        `The spam check is unavailable right now. Please try again, or email ${siteConfig.email}.`,
      );
    }
  }

  // 9. Mail configuration
  const problems = mailConfigProblems(deps.env);
  const provider = deps.provider;
  if (!provider || problems.length > 0) {
    logOnce(deps, 'lead.email_not_configured', {
      status: 503,
      missing: problems.length > 0 ? problems : ['RESEND_API_KEY'],
    });
    return fail(503, 'email_not_configured', `We can't take your message right now. ${mailto()}`);
  }

  // 10. Build and send
  const reference = lead.clientReference ?? generateReference(deps.randomBytes);
  const recipients = parseRecipients(deps.env.LEAD_TO_EMAIL);
  const email = buildLeadEmail(lead, {
    reference,
    // Development fallbacks only: production requires both variables (mailConfigProblems).
    from: deps.env.LEAD_FROM_EMAIL ?? 'IK Leads <onboarding@resend.dev>',
    to: recipients.length > 0 ? recipients : [siteConfig.email],
  });

  const started = Date.now();
  let result: SendResult;
  try {
    result = await provider.send(email, AbortSignal.timeout(PROVIDER_TIMEOUT_MS));
  } catch (error) {
    result = { ok: false, code: errorName(error) };
  }
  const durationMs = Date.now() - started;

  if (result.ok) {
    deps.log('info', 'lead.sent', {
      ref: reference,
      type: lead.type,
      provider: provider.name,
      durationMs,
    });
    return respond(200, {
      ok: true,
      reference,
      delivery: provider.name === 'console' ? 'console' : 'sent',
    });
  }

  const deliveryMessage = `We could not send your message. Please try again, or email ${siteConfig.email}.`;
  const base = { ref: reference, type: lead.type, provider: provider.name, code: result.code };

  // The same key is still being processed: tell the client to retry shortly.
  if (result.code === 'concurrent_idempotent_requests') {
    deps.log('warn', 'lead.idempotency_in_flight', { ...base, status: 503 });
    return fail(503, 'delivery_failed', deliveryMessage, {
      reference,
      headers: { 'Retry-After': '5' },
    });
  }
  // Impossible by construction (the key embeds a content hash). Mapped so nothing ever loops.
  if (result.code === 'invalid_idempotent_request') {
    deps.log('error', 'lead.idempotency_conflict', { ...base, status: 502 });
    return fail(502, 'delivery_failed', deliveryMessage, { reference });
  }

  deps.log('error', 'lead.delivery_failed', {
    ...base,
    ...(result.status !== undefined ? { status: result.status } : {}),
  });
  return fail(502, 'delivery_failed', deliveryMessage, { reference });
}

/** OPTIONS: no CORS headers, because the form is same-origin. */
export function handleLeadOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: { ...NO_STORE, Allow: 'POST, OPTIONS' },
  });
}
