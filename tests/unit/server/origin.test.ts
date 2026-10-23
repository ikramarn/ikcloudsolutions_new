import type { DeploymentTier } from '@/config/tier';
import { allowedOrigins, isOriginAllowed, type OriginPolicyInput } from '@/lib/server/origin';

const base: OriginPolicyInput = {
  origin: 'https://ikcloudsolutions.com',
  secFetchSite: null,
  siteUrl: 'https://ikcloudsolutions.com',
  nodeEnv: 'production',
  tier: 'production',
};

const allowed = (over: Partial<OriginPolicyInput>) => isOriginAllowed({ ...base, ...over });

describe('origin policy matrix', () => {
  it('allows the site origin in every environment', () => {
    for (const nodeEnv of ['production', 'development', 'test']) {
      expect(allowed({ nodeEnv })).toBe(true);
    }
  });

  it('rejects foreign, malformed and "null" origins', () => {
    expect(allowed({ origin: 'https://evil.example' })).toBe(false);
    expect(allowed({ origin: 'https://ikcloudsolutions.com.evil.example' })).toBe(false);
    expect(allowed({ origin: 'http://ikcloudsolutions.com' })).toBe(false);
    expect(allowed({ origin: 'null' })).toBe(false);
    expect(allowed({ origin: 'not a url' })).toBe(false);
  });

  it('trusts localhost:3000 only outside production, whatever the tier', () => {
    const origin = 'http://localhost:3000';
    expect(allowed({ origin, nodeEnv: 'development', tier: 'local' })).toBe(true);
    expect(allowed({ origin, nodeEnv: 'test', tier: 'local' })).toBe(true);
    // A self-hosted production build is tier "local" but must not trust localhost.
    expect(allowed({ origin, nodeEnv: 'production', tier: 'local' })).toBe(false);
    expect(allowed({ origin, nodeEnv: 'production', tier: 'production' })).toBe(false);
  });

  it('allows the per-deployment and branch hostnames only on the preview tier', () => {
    const preview: Partial<OriginPolicyInput> = {
      tier: 'preview',
      vercelUrl: 'ik-abc123.vercel.app',
      vercelBranchUrl: 'ik-git-feature.vercel.app',
    };
    expect(allowed({ ...preview, origin: 'https://ik-abc123.vercel.app' })).toBe(true);
    expect(allowed({ ...preview, origin: 'https://ik-git-feature.vercel.app' })).toBe(true);
    expect(allowed({ ...preview, origin: 'https://other.vercel.app' })).toBe(false);
    for (const tier of ['production', 'local'] as DeploymentTier[]) {
      expect(allowed({ ...preview, tier, origin: 'https://ik-abc123.vercel.app' })).toBe(false);
    }
  });

  it('falls back to Sec-Fetch-Site when Origin is absent', () => {
    expect(allowed({ origin: null, secFetchSite: 'same-origin' })).toBe(true);
    expect(allowed({ origin: null, secFetchSite: 'cross-site' })).toBe(false);
    expect(allowed({ origin: null, secFetchSite: 'same-site' })).toBe(false);
    expect(allowed({ origin: null, secFetchSite: 'none' })).toBe(false);
  });

  it('allows a header-less request (curl) only outside production', () => {
    expect(allowed({ origin: null, secFetchSite: null, nodeEnv: 'production' })).toBe(false);
    expect(allowed({ origin: null, secFetchSite: null, nodeEnv: 'development' })).toBe(true);
    expect(allowed({ origin: null, secFetchSite: null, nodeEnv: 'test' })).toBe(true);
  });

  it('lists the allowed origins', () => {
    expect([...allowedOrigins({ ...base, nodeEnv: 'development', tier: 'local' })].sort()).toEqual([
      'http://localhost:3000',
      'https://ikcloudsolutions.com',
    ]);
  });

  it('ignores an unusable site URL', () => {
    expect(allowedOrigins({ ...base, siteUrl: '' }).size).toBe(0);
  });
});
