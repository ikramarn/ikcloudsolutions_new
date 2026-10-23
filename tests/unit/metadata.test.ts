import { describe, expect, it } from 'vitest';
import { isIndexable, resolveDescription, routes } from '@/config/routes';
import { buildMetadata, buildRouteMetadata, TITLE_TEMPLATE } from '@/lib/seo/metadata';

describe('buildMetadata', () => {
  const base = { path: '/ai-agents', title: 'AI Agents', description: 'A description.' };

  it('uses the title template and resolves canonical against metadataBase', () => {
    const metadata = buildMetadata(base);
    expect(TITLE_TEMPLATE).toBe('%s | IK Cloud Solutions');
    expect(metadata.title).toBe('AI Agents');
    expect(metadata.alternates?.canonical).toBe('/ai-agents');
    expect(String(metadata.metadataBase)).toBe('https://example.test/');
  });

  it('always emits explicit Open Graph and Twitter images', () => {
    const metadata = buildMetadata({ ...base, ogImage: '/og/ai-agents' });
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      siteName: 'IK Cloud Solutions',
      locale: 'en_GB',
      url: '/ai-agents',
      images: [{ url: '/og/ai-agents', width: 1200, height: 630 }],
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: [{ url: '/og/ai-agents', width: 1200, height: 630 }],
    });
  });

  it('falls back to the default card when the route has none', () => {
    const metadata = buildMetadata({ ...base, path: '/not-in-registry' });
    expect(metadata.openGraph?.images).toEqual([expect.objectContaining({ url: '/og/default' })]);
    expect(metadata.twitter?.images).toEqual([expect.objectContaining({ url: '/og/default' })]);
  });

  it('supports absolute titles', () => {
    const metadata = buildMetadata({ ...base, title: 'Complete title', titleAbsolute: true });
    expect(metadata.title).toEqual({ absolute: 'Complete title' });
    expect(metadata.openGraph?.title).toBe('Complete title');
  });

  it('adds robots noindex only when asked', () => {
    expect(buildMetadata(base).robots).toBeUndefined();
    expect(buildMetadata({ ...base, noindex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});

describe('buildRouteMetadata', () => {
  it('reads title, description and OG card from the registry', () => {
    const home = routes.find((route) => route.path === '/');
    const metadata = buildRouteMetadata('/');
    expect(metadata.title).toEqual({ absolute: home?.title });
    expect(metadata.description).toBe(home ? resolveDescription(home) : undefined);
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({ url: home?.ogImagePath }),
    ]);
  });

  it('throws for a path that is not in the registry', () => {
    expect(() => buildRouteMetadata('/nope')).toThrow(/No route registry entry/);
  });
});

describe('route registry rules', () => {
  it('has unique paths, titles and descriptions', () => {
    const paths = routes.map((route) => route.path);
    const titles = routes.map((route) => route.title);
    const descriptions = routes.map(resolveDescription);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('keeps titles and descriptions within search-result limits', () => {
    for (const route of routes) {
      const description = resolveDescription(route);
      expect(description.length, route.path).toBeGreaterThanOrEqual(70);
      expect(description.length, route.path).toBeLessThanOrEqual(160);
      if (!route.titleAbsolute) expect(route.title.length, route.path).toBeLessThanOrEqual(39);
    }
  });

  it('has parents that exist and chains that end at / without cycles', () => {
    const byPath = new Map(routes.map((route) => [route.path, route]));
    for (const route of routes) {
      const seen = new Set<string>([route.path]);
      let current = route;
      while (current.parent) {
        const parent = byPath.get(current.parent);
        expect(parent, `${route.path} -> ${current.parent}`).toBeDefined();
        if (!parent) break;
        expect(seen.has(parent.path), `cycle at ${parent.path}`).toBe(false);
        seen.add(parent.path);
        current = parent;
      }
      if (route.path !== '/') expect(current.path, route.path).toBe('/');
    }
  });

  it('treats the home page as indexable', () => {
    const home = routes.find((route) => route.path === '/');
    expect(home && isIndexable(home)).toBe(true);
  });
});
