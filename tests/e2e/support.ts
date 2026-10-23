import { hubFaq, howItWorksFaq, pricingFaq, voiceFaq, whatsappFaq } from '@/content/agents/faq';
import { industries } from '@/content/agents/industries';
import { buildCopyContext, resolveFaq, type FaqItem } from '@/lib/copy/faq';
import { stripLinkTokens } from '@/lib/copy/link-tokens';
import type { Page } from './helpers';

export const ORIGIN = 'http://localhost:3100';
export const STUB_ORIGIN = 'http://localhost:3199';

/** The only localStorage keys the site may ever write (cookie choice and two Academy keys). */
export const ALLOWED_STORAGE_KEYS = [
  'ik_consent_v1',
  'ik_academy_progress_v1',
  'ik_academy_courses_v1',
] as const;

export const CONSENT_KEY = 'ik_consent_v1';

/** Pages that render a FAQ, with the plain-text answers the server HTML must contain. */
export function faqAnswersByPath(): Record<string, string[]> {
  const ctx = buildCopyContext();
  const plain = (items: readonly FaqItem[]) =>
    resolveFaq(items, ctx).map((item) => stripLinkTokens(item.answer));
  const byPath: Record<string, string[]> = {
    '/ai-agents': plain(hubFaq),
    '/ai-agents/pricing': plain(pricingFaq),
    '/ai-agents/voice': plain(voiceFaq),
    '/ai-agents/whatsapp': plain(whatsappFaq),
    '/ai-agents/how-it-works': plain(howItWorksFaq),
  };
  for (const industry of industries) {
    byPath[`/ai-agents/for/${industry.slug}`] = plain(industry.faq);
  }
  return byPath;
}

/** Removes whitespace so inline links and `<!-- -->` separators cannot cause false mismatches. */
export function squash(text: string): string {
  return text.replace(/\s+/g, '');
}

/** Stores a "reject" cookie choice before any page script runs, so the banner stays out of the way. */
export async function preDecideConsent(page: Page): Promise<void> {
  await page.addInitScript((key: string) => {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({ version: 1, analytics: false, decidedAt: new Date().toISOString() }),
      );
    } catch {
      // Storage unavailable: the banner simply shows.
    }
  }, CONSENT_KEY);
}

/** Collects uncaught exceptions and console errors for the lifetime of the page. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
  });
  return errors;
}

/** Width and height from the IHDR chunk of a PNG, or null when the bytes are not a PNG. */
export function readPngSize(bytes: Buffer): { width: number; height: number } | null {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(signature)) return null;
  if (bytes.subarray(12, 16).toString('ascii') !== 'IHDR') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/** True when the page is wider than the viewport (a horizontal scrollbar would appear). */
export async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth;
  });
}

/** Counts inputs a payment or login form would need. Both must always be zero. */
export async function forbiddenInputCount(page: Page): Promise<number> {
  return page.evaluate(
    () => document.querySelectorAll('input[type="password"], input[autocomplete^="cc-"]').length,
  );
}

/** A valid contact-form body for direct API calls. */
export function contactPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    type: 'contact',
    firstName: 'Test',
    lastName: 'Person',
    email: 'test.person@example.test',
    subject: 'E2E enquiry',
    interest: 'AI Front Desk',
    message: 'This is an automated end-to-end test message.',
    hp_confirm_ref: '',
    ...overrides,
  };
}
