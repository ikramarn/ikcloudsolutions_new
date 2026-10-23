import type { Route } from 'next';
import { publicEnv } from '@/config/env';
import type { AddonId, Channel, PlanId } from '@/config/pricing';
import type { BillingPeriod } from '@/lib/money';

const INTAKE_PATH = '/ai-agents/get-started' as const;

export interface GetStartedOptions {
  plan?: PlanId;
  channel?: Channel;
  billing?: BillingPeriod;
  /** Pre-selects an industry in the intake form. */
  industry?: 'clinics' | 'estate-agents' | 'home-services';
  /** Pre-selects add-ons in the intake form (unknown ids are dropped there). */
  addons?: readonly AddonId[];
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
  if (opts?.industry) params.set('industry', opts.industry);
  if (opts?.addons && opts.addons.length > 0) params.set('addons', opts.addons.join(','));
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
