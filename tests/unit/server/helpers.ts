import { vi, type Mock } from 'vitest';
import { handleLead, type LeadDeps } from '@/lib/server/handler';
import { parseServerEnv, type EnvSource } from '@/lib/server/env';
import { InMemoryRateLimiter } from '@/lib/server/rate-limit';
import type { MailProvider, OutboundEmail, SendResult } from '@/lib/server/mail/types';

export const SITE = 'https://example.test';

export const productionEnv: EnvSource = {
  NODE_ENV: 'production',
  RESEND_API_KEY: 're_test_stub',
  LEAD_TO_EMAIL: 'owner@example.test',
  LEAD_FROM_EMAIL: 'IK Leads <leads@example.test>',
};

export const contactBody = {
  type: 'contact',
  firstName: 'Alex',
  lastName: 'Murray',
  email: 'alex@example.com',
  subject: 'Cloud costs',
  interest: 'FinOps review',
  message: 'We would like help reviewing our cloud bill.',
} as const;

export const consultationBody = {
  type: 'consultation',
  name: 'Alex Murray',
  email: 'alex@example.com',
  focus: 'FinOps review',
  cloudProvider: 'AWS',
  monthlySpend: '£5k-£25k',
  preferredTimeWindow: 'morning',
} as const;

export const agentLeadBody = {
  type: 'agent-lead',
  contactName: 'Alex Murray',
  businessName: 'Meadowbank Dental Practice',
  email: 'alex@example.com',
  industry: 'clinics',
  channel: 'both',
  plan: 'starter',
  setupPreference: 'done-for-you',
  consent: true,
} as const;

export interface FakeProvider extends MailProvider {
  send: Mock<(message: OutboundEmail, signal: AbortSignal) => Promise<SendResult>>;
}

export function fakeProvider(
  result: SendResult | (() => Promise<SendResult>) = { ok: true, id: 'fake' },
  name: MailProvider['name'] = 'resend',
): FakeProvider {
  const send = vi.fn(async (_message: OutboundEmail, _signal: AbortSignal) =>
    typeof result === 'function' ? result() : result,
  );
  return { name, send };
}

export interface Harness {
  deps: LeadDeps;
  log: ReturnType<typeof vi.fn>;
  provider: FakeProvider;
}

let counter = 0;

/** Deterministic bytes 0..n-1, so the generated reference is IK-23456789. */
const sequentialBytes = (length: number) => Uint8Array.from({ length }, (_value, i) => i);

export function makeHarness(
  overrides: Partial<LeadDeps> = {},
  envSource: EnvSource = productionEnv,
): Harness {
  const provider = fakeProvider();
  const log = vi.fn();
  const deps: LeadDeps = {
    env: parseServerEnv(envSource),
    tier: 'local',
    siteUrl: SITE,
    turnstileSiteKey: undefined,
    provider,
    rateLimiter: new InMemoryRateLimiter(),
    verifyTurnstile: vi.fn(async () => 'ok' as const),
    now: () => new Date('2026-10-22T12:00:00Z'),
    log,
    randomBytes: sequentialBytes,
    loggedOnce: new Set<string>(),
    ...overrides,
  };
  return { deps, log, provider: (overrides.provider as FakeProvider | undefined) ?? provider };
}

export interface RequestOptions {
  headers?: Record<string, string | null>;
  /** Raw body, used instead of JSON.stringify(body). */
  raw?: BodyInit;
  method?: string;
}

/** A unique x-forwarded-for per request keeps tests out of each other's rate-limit buckets. */
export function makeRequest(body: unknown, options: RequestOptions = {}): Request {
  counter += 1;
  const headers = new Headers({
    origin: SITE,
    'content-type': 'application/json',
    'x-forwarded-for': `10.0.${Math.floor(counter / 250)}.${counter % 250}`,
  });
  for (const [key, value] of Object.entries(options.headers ?? {})) {
    if (value === null) headers.delete(key);
    else headers.set(key, value);
  }
  return new Request(`${SITE}/api/lead`, {
    method: options.method ?? 'POST',
    headers,
    body: options.raw ?? JSON.stringify(body),
  });
}

export async function post(
  harness: Harness,
  body: unknown,
  options: RequestOptions = {},
): Promise<{ response: Response; json: Record<string, unknown> }> {
  const response = await handleLead(makeRequest(body, options), harness.deps);
  const json = (await response.json()) as Record<string, unknown>;
  return { response, json };
}

export function errorOf(json: Record<string, unknown>): {
  code: string;
  message: string;
  fields?: Record<string, string>;
  reference?: string;
} {
  return json.error as { code: string; message: string };
}
