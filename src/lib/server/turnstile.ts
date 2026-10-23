import 'server-only';
import { deploymentTier, type DeploymentTier } from '@/config/tier';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_TIMEOUT_MS = 4000;

// Cloudflare's published always-pass and always-fail dummy secrets start with 1x, 2x or 3x
// followed by zeros (for example 1x0000000000000000000000000000000AA).
export const CLOUDFLARE_TEST_SECRET = /^[123]x0{10,}/;

/**
 * The hostname binding (a token minted for another site is rejected) only runs on the Production
 * tier with a real secret. Preview hostnames vary, dummy keys are not bound to a site, and local
 * runs have no stable hostname.
 */
export function shouldEnforceHostname(tier: DeploymentTier, secret: string): boolean {
  return tier === 'production' && !CLOUDFLARE_TEST_SECRET.test(secret);
}

export type TurnstileResult = 'ok' | 'captcha_failed' | 'captcha_unavailable';

export interface VerifyTurnstileInput {
  secret: string;
  token: string | undefined;
  /** Client IP, sent as remoteip when known. */
  ip?: string | undefined;
  siteUrl: string;
  tier?: DeploymentTier;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

interface SiteverifyResponse {
  success?: unknown;
  hostname?: unknown;
}

/** Fails closed: any problem reaching Cloudflare is `captcha_unavailable`, never a pass. */
export async function verifyTurnstile(input: VerifyTurnstileInput): Promise<TurnstileResult> {
  const token = input.token?.trim();
  if (!token) return 'captcha_failed';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.timeoutMs ?? TURNSTILE_TIMEOUT_MS);
  try {
    const body = new URLSearchParams({ secret: input.secret, response: token });
    if (input.ip && input.ip !== 'unknown') body.set('remoteip', input.ip);

    const response = await (input.fetchImpl ?? fetch)(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });
    if (!response.ok) return 'captcha_unavailable';

    const result = (await response.json()) as SiteverifyResponse;
    if (result.success !== true) return 'captcha_failed';

    const tier = input.tier ?? deploymentTier();
    if (shouldEnforceHostname(tier, input.secret)) {
      let expected: string;
      try {
        expected = new URL(input.siteUrl).hostname;
      } catch {
        return 'captcha_failed';
      }
      if (result.hostname !== expected) return 'captcha_failed';
    }
    return 'ok';
  } catch {
    return 'captcha_unavailable';
  } finally {
    clearTimeout(timer);
  }
}
