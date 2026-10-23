import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { isIndexable, pricingDescription, resolveDescription, routes } from '@/config/routes';
import { OG_CARD_IDS, ogCards } from '@/content/og';
import { isFutureDate } from '@/lib/dates';
import type { VatMode } from '@/lib/money';

const VAT_MODES: VatMode[] = ['exclusive', 'inclusive', 'not-registered'];
const withMode = (mode: VatMode): PricingConfig => ({
  ...pricingConfig,
  vat: { mode, ratePercent: 20 },
});

/** Every description, with the config-derived one resolved for the given VAT mode. */
function descriptionsFor(mode: VatMode): { path: string; text: string }[] {
  return routes.map((route) => ({
    path: route.path,
    text:
      route.path === '/ai-agents/pricing'
        ? pricingDescription(withMode(mode))
        : resolveDescription(route),
  }));
}

describe('route registry', () => {
  it('lists every page route exactly once', () => {
    const paths = routes.map((route) => route.path).sort();
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(
      [
        '/',
        '/services',
        '/about',
        '/contact',
        '/academy',
        '/academy/studio',
        '/ai-agents',
        '/ai-agents/pricing',
        '/ai-agents/voice',
        '/ai-agents/whatsapp',
        '/ai-agents/websites',
        '/ai-agents/done-for-you',
        '/ai-agents/how-it-works',
        '/ai-agents/for/clinics',
        '/ai-agents/for/estate-agents',
        '/ai-agents/for/home-services',
        '/ai-agents/get-started',
        '/privacy',
        '/terms',
        '/acceptable-use',
        '/cookies',
        '/refund-and-cancellation',
        '/security',
        '/dpa-summary',
      ].sort(),
    );
  });

  it('has a page file for every entry', () => {
    for (const route of routes) {
      const industry = /^\/ai-agents\/for\/[^/]+$/.test(route.path);
      const dir = industry
        ? join('src', 'app', 'ai-agents', 'for', '[industry]')
        : join('src', 'app', ...route.path.split('/').filter(Boolean));
      expect(existsSync(join(process.cwd(), dir, 'page.tsx')), route.path).toBe(true);
    }
  });

  it('has exactly three industry routes', () => {
    expect(routes.filter((route) => route.path.startsWith('/ai-agents/for/'))).toHaveLength(3);
  });

  it('has unique titles and descriptions', () => {
    const titles = routes.map((route) => route.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const mode of VAT_MODES) {
      const texts = descriptionsFor(mode).map((item) => item.text);
      expect(new Set(texts).size, mode).toBe(texts.length);
    }
  });

  it('keeps the title segment to 39 characters or fewer', () => {
    for (const route of routes) {
      if (!route.titleAbsolute) expect(route.title.length, route.path).toBeLessThanOrEqual(39);
    }
  });

  it.each(VAT_MODES)('keeps descriptions between 70 and 160 characters in %s mode', (mode) => {
    for (const { path, text } of descriptionsFor(mode)) {
      expect(text.length, path).toBeGreaterThanOrEqual(70);
      expect(text.length, path).toBeLessThanOrEqual(160);
    }
  });

  it('has parents that exist and parent chains that end at / without cycles', () => {
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

  it('has no lastModified that is a future date or not a date', () => {
    for (const route of routes) {
      expect(route.lastModified, route.path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(isFutureDate(route.lastModified), route.path).toBe(false);
    }
  });

  it('points every ogImagePath at a card that exists', () => {
    const ids = new Set<string>(OG_CARD_IDS);
    for (const route of routes) {
      expect(route.ogImagePath, route.path).toMatch(/^\/og\/[a-z-]+$/);
      expect(ids.has(route.ogImagePath.replace('/og/', '')), route.path).toBe(true);
    }
    expect(Object.keys(ogCards).sort()).toEqual([...OG_CARD_IDS].sort());
  });

  it('has no priority or changeFrequency fields', () => {
    for (const route of routes) {
      expect(route).not.toHaveProperty('priority');
      expect(route).not.toHaveProperty('changeFrequency');
    }
  });

  it('keeps the Academy out of the index and the legal pages behind legalReviewed', () => {
    const byPath = new Map(routes.map((route) => [route.path, route]));
    expect(byPath.get('/academy')?.indexable).toBe(false);
    expect(byPath.get('/academy/studio')?.indexable).toBe(false);
    for (const path of [
      '/privacy',
      '/terms',
      '/acceptable-use',
      '/cookies',
      '/refund-and-cancellation',
      '/security',
      '/dpa-summary',
    ]) {
      const entry = byPath.get(path);
      expect(entry?.indexable, path).toBe('when-legal-reviewed');
      expect(entry && isIndexable(entry), path).toBe(false);
    }
  });
});
