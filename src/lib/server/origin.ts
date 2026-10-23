import 'server-only';
import type { DeploymentTier } from '@/config/tier';

export interface OriginPolicyInput {
  /** The Origin request header, or null when absent. */
  origin: string | null;
  /** The Sec-Fetch-Site request header, or null when absent. */
  secFetchSite: string | null;
  /** siteConfig.url */
  siteUrl: string;
  nodeEnv: string | undefined;
  tier: DeploymentTier;
  vercelUrl?: string | undefined;
  vercelBranchUrl?: string | undefined;
}

function originOf(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** The set of origins allowed to post to the lead API. */
export function allowedOrigins(input: OriginPolicyInput): Set<string> {
  const allowed = new Set<string>();
  const site = originOf(input.siteUrl);
  if (site) allowed.add(site);
  // The tier is not consulted for localhost: a self-hosted production build is tier "local" but
  // must not trust it.
  if (input.nodeEnv !== 'production') allowed.add('http://localhost:3000');
  if (input.tier === 'preview') {
    for (const host of [input.vercelUrl, input.vercelBranchUrl]) {
      const origin = host ? originOf(`https://${host}`) : null;
      if (origin) allowed.add(origin);
    }
  }
  return allowed;
}

/**
 * Origin required. If absent, Sec-Fetch-Site: same-origin is accepted. With neither (curl) the
 * request is allowed only outside production.
 */
export function isOriginAllowed(input: OriginPolicyInput): boolean {
  if (input.origin !== null) {
    const origin = originOf(input.origin);
    return origin !== null && allowedOrigins(input).has(origin);
  }
  if (input.secFetchSite !== null) return input.secFetchSite === 'same-origin';
  return input.nodeEnv !== 'production';
}
