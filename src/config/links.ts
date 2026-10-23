import type { Route } from 'next';
import { publicEnv } from '@/config/env';

export const INTAKE_PATH = '/ai-agents/get-started' as const;

// Option value unions mirror the pricing config (plan ids, channels) and src/lib/money.ts
// (billing periods). FEAT-002 can switch these to type imports once those modules exist.
export interface GetStartedOptions {
  plan?: 'starter' | 'pro' | 'premium';
  channel?: 'voice' | 'whatsapp' | 'both';
  billing?: 'monthly' | 'annual';
}

/**
 * Casts a known-good internal path to Route. Typed routes only know pages that exist, and
 * hashes or query strings are not part of the union, so the cast lives in this one place.
 */
export function asRoute(path: string): Route {
  return path as Route;
}

function toQuery(opts: GetStartedOptions | undefined): string {
  const params = new URLSearchParams();
  if (opts?.plan) params.set('plan', opts.plan);
  if (opts?.channel) params.set('channel', opts.channel);
  if (opts?.billing) params.set('billing', opts.billing);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * The single place CTAs are built. With NEXT_PUBLIC_APP_URL set it points at the customer app
 * signup (external); otherwise it points at the on-site intake form.
 */
export function getStartedHref(opts?: GetStartedOptions): Route | (string & {}) {
  const query = toQuery(opts);
  if (publicEnv.appUrl) return `${publicEnv.appUrl}/signup${query}`;
  return `${INTAKE_PATH}${query}`;
}

export function isExternalCta(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

// Done-for-you always uses the on-site intake.
export const doneForYouHref = INTAKE_PATH;
