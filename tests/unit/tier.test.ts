import { describe, expect, it } from 'vitest';
import { buildHeaders, deploymentTier, resolveSiteUrl } from '@/config/tier';

const headerValue = (rules: ReturnType<typeof buildHeaders>, source: string, key: string) =>
  rules
    .filter((r) => r.source === source)
    .flatMap((r) => r.headers)
    .find((h) => h.key === key)?.value;

describe('deploymentTier', () => {
  it('maps VERCEL_ENV production, preview and unset', () => {
    expect(deploymentTier({ VERCEL_ENV: 'production' })).toBe('production');
    expect(deploymentTier({ VERCEL_ENV: 'preview' })).toBe('preview');
    expect(deploymentTier({})).toBe('local');
  });

  it('treats development and unknown values as local', () => {
    expect(deploymentTier({ VERCEL_ENV: 'development' })).toBe('local');
    expect(deploymentTier({ VERCEL_ENV: 'something-else' })).toBe('local');
  });
});

describe('resolveSiteUrl', () => {
  it('uses NEXT_PUBLIC_SITE_URL and trims trailing slashes', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://ikcloudsolutions.com/' })).toBe(
      'https://ikcloudsolutions.com',
    );
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: ' http://localhost:3100// ' })).toBe(
      'http://localhost:3100',
    );
  });

  it('throws in production when NEXT_PUBLIC_SITE_URL is missing', () => {
    expect(() => resolveSiteUrl({ VERCEL_ENV: 'production' })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it('accepts an explicit URL in production', () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://ikcloudsolutions.com',
      }),
    ).toBe('https://ikcloudsolutions.com');
  });

  it('uses https://VERCEL_URL in preview', () => {
    expect(resolveSiteUrl({ VERCEL_ENV: 'preview', VERCEL_URL: 'ik-git-feat.vercel.app' })).toBe(
      'https://ik-git-feat.vercel.app',
    );
  });

  it('falls back to localhost:3000 locally and in preview without VERCEL_URL', () => {
    expect(resolveSiteUrl({})).toBe('http://localhost:3000');
    expect(resolveSiteUrl({ VERCEL_ENV: 'preview' })).toBe('http://localhost:3000');
  });

  it('rejects non-http(s) and malformed values', () => {
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'ftp://example.test' })).toThrow(/http/);
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'javascript:alert(1)' })).toThrow();
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'not a url' })).toThrow();
  });
});

describe('buildHeaders', () => {
  it('adds security headers on all tiers and never noindex outside preview', () => {
    for (const tier of ['production', 'local'] as const) {
      const rules = buildHeaders(tier, 'production');
      expect(headerValue(rules, '/:path*', 'X-Content-Type-Options')).toBe('nosniff');
      expect(headerValue(rules, '/:path*', 'X-Frame-Options')).toBe('DENY');
      expect(headerValue(rules, '/:path*', 'X-Robots-Tag')).toBeUndefined();
      expect(headerValue(rules, '/academy/:path*', 'X-Robots-Tag')).toBe('noindex, nofollow');
    }
  });

  it('adds a site-wide noindex only in preview', () => {
    const rules = buildHeaders('preview', 'production');
    expect(headerValue(rules, '/:path*', 'X-Robots-Tag')).toBe('noindex');
  });

  it('allows unsafe-eval in the CSP only when NODE_ENV is development', () => {
    const csp = (tier: 'production' | 'local', env: string) =>
      headerValue(buildHeaders(tier, env), '/:path*', 'Content-Security-Policy') ?? '';
    expect(csp('production', 'production')).not.toContain('unsafe-eval');
    expect(csp('local', 'production')).not.toContain('unsafe-eval');
    expect(csp('local', 'development')).toContain("'unsafe-eval'");
  });

  it('keeps HSTS free of includeSubDomains and preload', () => {
    const hsts = headerValue(
      buildHeaders('production', 'production'),
      '/:path*',
      'Strict-Transport-Security',
    );
    expect(hsts).toBe('max-age=31536000');
  });
});
