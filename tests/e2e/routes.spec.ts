import { redirectRules } from '@/config/redirects';
import { isIndexable, routes } from '@/config/routes';
import { visibleHtmlText } from '../unit/claims-guard.html';
import { expect, test } from './helpers';
import {
  ORIGIN,
  collectErrors,
  faqAnswersByPath,
  forbiddenInputCount,
  hasHorizontalOverflow,
  readPngSize,
  squash,
} from './support';

const WIDTHS = [360, 768, 1280, 1920] as const;
const faqByPath = faqAnswersByPath();

function metaContent(html: string, attribute: 'name' | 'property', value: string): string[] {
  const found: string[] = [];
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = new RegExp(`\\b${attribute}\\s*=\\s*["']${value}["']`, 'i').test(tag[0]);
    if (!name) continue;
    const content = /\bcontent\s*=\s*"([^"]*)"/i.exec(tag[0])?.[1];
    if (content !== undefined) found.push(content.replace(/&amp;/g, '&'));
  }
  return found;
}

test.describe('every registry route', () => {
  for (const route of routes) {
    test(`${route.path} is a healthy page`, async ({ page, request }) => {
      test.setTimeout(60_000);
      const errors = collectErrors(page);
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await page.waitForLoadState('networkidle');

      // Exactly one h1, a title and the canonical URL.
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/\S/);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      // Compared as URLs, so the home page's "http://localhost:3100" equals "http://localhost:3100/".
      expect(new URL(canonical ?? 'invalid:').href).toBe(new URL(route.path, ORIGIN).href);

      // Indexing policy: the local server is tier "local", which behaves like production.
      const headers = response?.headers() ?? {};
      const robotsMeta = await page
        .locator('meta[name="robots"]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('content') ?? ''));
      if (isIndexable(route)) {
        expect(robotsMeta.join(' ')).not.toMatch(/noindex/i);
        expect(headers['x-robots-tag'] ?? '').not.toMatch(/noindex/i);
      } else {
        expect(robotsMeta.join(' ')).toMatch(/noindex/i);
        if (route.path.startsWith('/academy')) {
          expect(headers['x-robots-tag'] ?? '').toMatch(/noindex/i);
        }
      }

      // JSON-LD parses, and there is at least one block.
      const blocks = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''));
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(() => JSON.parse(block)).not.toThrow();
      }

      // Explicit social images that really exist: 200 image/png at 1200x630.
      const html = await (await request.get(route.path)).text();
      for (const [attribute, key] of [
        ['property', 'og:image'],
        ['name', 'twitter:image'],
      ] as const) {
        const urls = metaContent(html, attribute, key);
        expect(urls.length, `${key} present`).toBeGreaterThan(0);
        for (const url of urls) {
          const image = await request.get(url);
          expect(image.status(), url).toBe(200);
          expect(image.headers()['content-type'], url).toContain('image/png');
          expect(readPngSize(await image.body()), url).toEqual({ width: 1200, height: 630 });
        }
      }

      // FAQ answers are in the server HTML (fetched without running any JavaScript).
      const answers = faqByPath[route.path];
      if (answers) {
        const squashed = squash(visibleHtmlText(html));
        for (const answer of answers) {
          expect(squashed, answer.slice(0, 60)).toContain(squash(answer));
        }
      }

      // No payment or login inputs anywhere in the rendered DOM.
      expect(await forbiddenInputCount(page)).toBe(0);

      // No horizontal overflow at four widths.
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        expect(await hasHorizontalOverflow(page), `${route.path} at ${width}px`).toBe(false);
      }

      expect(errors).toEqual([]);
    });
  }

  test('titles and descriptions are unique', async ({ request }) => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    for (const route of routes) {
      const html = await (await request.get(route.path)).text();
      const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '';
      const description = metaContent(html, 'name', 'description')[0] ?? '';
      expect(title, `${route.path} title`).not.toBe('');
      expect(description, `${route.path} description`).not.toBe('');
      expect(titles.get(title), `${route.path} repeats the title of ${titles.get(title)}`).toBe(
        undefined,
      );
      expect(
        descriptions.get(description),
        `${route.path} repeats the description of ${descriptions.get(description)}`,
      ).toBe(undefined);
      titles.set(title, route.path);
      descriptions.set(description, route.path);
    }
  });
});

test.describe('missing pages and old URLs', () => {
  test('an unknown URL returns the custom 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  });

  test('an unknown industry returns 404', async ({ request }) => {
    expect((await request.get('/ai-agents/for/bakery')).status()).toBe(404);
  });

  test('there are ten redirects and each one is a 308', async ({ request }) => {
    expect(redirectRules).toHaveLength(10);
    for (const rule of redirectRules) {
      const response = await request.get(rule.source, { maxRedirects: 0 });
      expect(response.status(), rule.source).toBe(308);
      const location = response.headers()['location'] ?? '';
      expect(new URL(location, ORIGIN).pathname + new URL(location, ORIGIN).hash).toBe(
        new URL(rule.destination, ORIGIN).pathname + new URL(rule.destination, ORIGIN).hash,
      );
    }
  });
});
