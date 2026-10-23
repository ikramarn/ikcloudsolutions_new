import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import manifest from '@/app/manifest';
import { redirectRules } from '@/config/redirects';
import { isIndexable, routes } from '@/config/routes';
import { siteConfig } from '@/config/site';
import { buildHeaders, type DeploymentTier } from '@/config/tier';

afterEach(() => {
  vi.unstubAllEnvs();
});

const headerValues = (tier: DeploymentTier, nodeEnv: string, source: string, key: string) =>
  buildHeaders(tier, nodeEnv)
    .filter((rule) => rule.source === source)
    .flatMap((rule) => rule.headers)
    .filter((header) => header.key === key)
    .map((header) => header.value);

describe('robots()', () => {
  it('allows crawling and lists the sitemap in production', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    const result = robots();
    expect(result.rules).toEqual({ userAgent: '*', allow: '/', disallow: ['/api/'] });
    expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });

  it('treats an unset VERCEL_ENV like production, so local builds are indexable', () => {
    vi.stubEnv('VERCEL_ENV', undefined);
    const result = robots();
    expect(result.rules).toEqual({ userAgent: '*', allow: '/', disallow: ['/api/'] });
    expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });

  it('blocks everything and publishes no sitemap in preview', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    const result = robots();
    expect(result.rules).toEqual({ userAgent: '*', disallow: '/' });
    expect(result.sitemap).toBeUndefined();
  });

  it('does not disallow /academy, so its noindex tag stays visible', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(JSON.stringify(robots())).not.toContain('academy');
  });
});

describe('buildHeaders() per tier', () => {
  it.each<DeploymentTier>(['production', 'preview', 'local'])(
    'sends the security headers and noindexes /academy on %s',
    (tier) => {
      expect(headerValues(tier, 'production', '/:path*', 'X-Content-Type-Options')).toEqual([
        'nosniff',
      ]);
      expect(headerValues(tier, 'production', '/:path*', 'Referrer-Policy')).toEqual([
        'strict-origin-when-cross-origin',
      ]);
      expect(headerValues(tier, 'production', '/:path*', 'Permissions-Policy')).toEqual([
        'camera=(), microphone=(), geolocation=(), payment=()',
      ]);
      expect(headerValues(tier, 'production', '/:path*', 'Strict-Transport-Security')).toEqual([
        'max-age=31536000',
      ]);
      expect(headerValues(tier, 'production', '/:path*', 'X-Frame-Options')).toEqual(['DENY']);
      expect(headerValues(tier, 'production', '/academy/:path*', 'X-Robots-Tag')).toEqual([
        'noindex, nofollow',
      ]);
    },
  );

  it('adds the global noindex only in preview', () => {
    expect(headerValues('preview', 'production', '/:path*', 'X-Robots-Tag')).toEqual(['noindex']);
    expect(headerValues('production', 'production', '/:path*', 'X-Robots-Tag')).toEqual([]);
    expect(headerValues('local', 'production', '/:path*', 'X-Robots-Tag')).toEqual([]);
  });

  it('puts unsafe-eval in script-src only when NODE_ENV is development', () => {
    const csp = (tier: DeploymentTier, env: string) =>
      headerValues(tier, env, '/:path*', 'Content-Security-Policy')[0] ?? '';
    for (const tier of ['production', 'preview', 'local'] as const) {
      expect(csp(tier, 'production'), tier).not.toContain('unsafe-eval');
    }
    const dev = csp('local', 'development');
    expect(dev).toContain("'unsafe-eval'");
    expect(dev.match(/script-src[^;]*/)?.[0]).toContain("'unsafe-eval'");
    expect(csp('local', 'development').replace("'unsafe-eval' ", '')).toBe(
      csp('local', 'production'),
    );
  });

  it('has a CSP that blocks objects, framing and foreign form posts', () => {
    const value = headerValues('production', 'production', '/:path*', 'Content-Security-Policy')[0];
    expect(value).toContain("object-src 'none'");
    expect(value).toContain("frame-ancestors 'none'");
    expect(value).toContain("form-action 'self'");
    expect(value).toContain("base-uri 'self'");
  });
});

describe('sitemap()', () => {
  it('lists exactly the indexable routes with absolute URLs', () => {
    const urls = sitemap().map((entry) => entry.url);
    const expected = routes
      .filter(isIndexable)
      .map((route) => `${siteConfig.url}${route.path === '/' ? '' : route.path}`);
    expect(urls).toEqual(expected);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('leaves out the Academy and the legal pages while legalReviewed is false', () => {
    expect(siteConfig.legalReviewed).toBe(false);
    const urls = sitemap().map((entry) => entry.url);
    for (const path of [
      '/academy',
      '/academy/studio',
      '/privacy',
      '/terms',
      '/acceptable-use',
      '/cookies',
      '/refund-and-cancellation',
      '/security',
      '/dpa-summary',
    ]) {
      expect(urls, path).not.toContain(`${siteConfig.url}${path}`);
    }
    expect(urls).toHaveLength(15);
  });

  it('carries lastModified and no priority or changeFrequency', () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry).not.toHaveProperty('priority');
      expect(entry).not.toHaveProperty('changeFrequency');
    }
  });
});

describe('manifest()', () => {
  it('is a browser-display manifest pointing at the icon routes', () => {
    const result = manifest();
    expect(result.display).toBe('browser');
    expect(result.icons?.map((icon) => icon.src)).toEqual(['/icon.svg', '/apple-icon']);
  });
});

describe('redirects', () => {
  it('maps every old URL permanently to its new home', () => {
    expect(redirectRules).toEqual(
      [
        ['/index.html', '/'],
        ['/contact.php', '/contact'],
        ['/trainer-studio', '/academy/studio'],
        ['/simulator', '/services#finops-estimator'],
        ['/ai-agent', '/ai-agents'],
        ['/ai-front-desk', '/ai-agents'],
        ['/agents', '/ai-agents'],
        ['/pricing', '/ai-agents/pricing'],
        ['/privacy-policy', '/privacy'],
        ['/terms-of-service', '/terms'],
      ].map(([source, destination]) => ({ source, destination, permanent: true })),
    );
  });

  it('never redirects a route that exists', () => {
    const paths = new Set(routes.map((route) => route.path));
    for (const rule of redirectRules) expect(paths.has(rule.source), rule.source).toBe(false);
  });

  it('only redirects to routes that exist', () => {
    const paths = new Set(routes.map((route) => route.path));
    for (const rule of redirectRules) {
      expect(paths.has(rule.destination.split('#')[0] ?? ''), rule.destination).toBe(true);
    }
  });
});
