import { routes } from '@/config/routes';
import { extractGuardableText, underivableFigures } from '../unit/claims-guard.html';
import { RULES } from '../unit/claims-guard.rules';
import { matchesAny } from '../unit/claims-guard.scan';
import { expect, test } from './helpers';

// Built-HTML claims-guard pass (amendment A2). It scans what a visitor or crawler can read:
// visible text, <title>, meta content values and JSON-LD strings. The RSC flight payload is
// never scanned, so "$1" style references in it cannot trigger the usd rule.

const LEGAL_PATHS = new Set([
  '/privacy',
  '/terms',
  '/acceptable-use',
  '/cookies',
  '/refund-and-cancellation',
  '/security',
  '/dpa-summary',
]);

/** Legal pages map onto the legal allow-list entries (for example warranty "guarantee" wording). */
const virtualPath = (path: string) =>
  LEGAL_PATHS.has(path)
    ? `src/content/legal${path}.html`
    : `built-html${path === '/' ? '/home' : path}.html`;

const PENCE_RULE_ID = 'pence-and-allowance-literals';

test.describe('built HTML claims-guard', () => {
  const pages = [...routes.map((route) => route.path), '/not-a-real-page'];

  for (const path of pages) {
    test(`${path} has no guarded claims in visible text`, async ({ request }) => {
      const response = await request.get(path);
      const html = await response.text();
      const text = extractGuardableText(html);

      // The extraction must be real: plenty of text, and no RSC flight data in it.
      expect(text.length).toBeGreaterThan(200);
      expect(text).not.toContain('__next_f');
      expect(text).not.toMatch(/\$undefined|\$L\d|Sreact\.fragment/);

      const file = virtualPath(path);
      const violations: string[] = [];
      for (const rule of RULES) {
        if (rule.scope === 'source' || rule.id === PENCE_RULE_ID) continue;
        if (matchesAny(file, rule.allow)) continue;
        const match = rule.re.exec(text);
        if (match) {
          const start = Math.max(0, match.index - 40);
          violations.push(
            `${rule.id}: ...${text.slice(start, match.index + match[0].length + 40)}...`,
          );
        }
      }
      expect(violations).toEqual([]);

      // Allowances, overage and discount figures must all be derivable from pricing.ts.
      const pence = RULES.find((rule) => rule.id === PENCE_RULE_ID);
      expect(pence).toBeDefined();
      if (pence) expect(underivableFigures(text, pence.re)).toEqual([]);
    });
  }

  test('a visible "$299" would be caught (the guard is live)', async () => {
    const text = extractGuardableText('<html><body><p>Only $299 a month</p></body></html>');
    const usd = RULES.find((rule) => rule.id === 'usd');
    expect(usd?.re.test(text)).toBe(true);
  });
});
