import { describe, expect, it } from 'vitest';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { hubFaq, howItWorksFaq, pricingFaq, voiceFaq, whatsappFaq } from '@/content/agents/faq';
import { industries } from '@/content/agents/industries';
import type { VatMode } from '@/lib/money';
import { buildCopyContext, resolveFaq, stripLinkTokens, type FaqItem } from '@/lib/copy/faq';

const modes: VatMode[] = ['exclusive', 'inclusive', 'not-registered'];

function withMode(mode: VatMode): PricingConfig {
  return { ...pricingConfig, vat: { mode, ratePercent: 20 } };
}

const pages: Record<string, readonly FaqItem[]> = {
  hub: hubFaq,
  pricing: pricingFaq,
  voice: voiceFaq,
  whatsapp: whatsappFaq,
  'how-it-works': howItWorksFaq,
  ...Object.fromEntries(industries.map((industry) => [industry.slug, industry.faq])),
};

describe('AI Front Desk content', () => {
  it('has exactly three industries', () => {
    expect(industries.map((industry) => industry.slug)).toEqual([
      'clinics',
      'estate-agents',
      'home-services',
    ]);
  });

  it('has the agreed FAQ sizes', () => {
    expect(hubFaq.length).toBeGreaterThanOrEqual(7);
    expect(hubFaq.length).toBeLessThanOrEqual(9);
    expect(pricingFaq).toHaveLength(8);
    expect(howItWorksFaq).toHaveLength(5);
  });

  it('uses unique ids within each FAQ', () => {
    for (const [name, items] of Object.entries(pages)) {
      const ids = items.map((item) => item.id);
      expect(new Set(ids).size, name).toBe(ids.length);
    }
  });

  describe.each(modes)('FAQ answers in %s VAT mode', (mode) => {
    const ctx = buildCopyContext(withMode(mode));

    it.each(Object.entries(pages))('%s resolves to clean text', (_name, items) => {
      for (const item of resolveFaq(items, ctx)) {
        const text = stripLinkTokens(item.answer);
        expect(text.length, item.id).toBeGreaterThan(20);
        expect(text, item.id).not.toMatch(/undefined|NaN|\{\{|\[object/);
      }
    });
  });

  it('derives pricing FAQ figures from config and follows the VAT mode', () => {
    const answer = (mode: VatMode, id: string) =>
      resolveFaq(pricingFaq, buildCopyContext(withMode(mode))).find((item) => item.id === id)
        ?.answer;
    expect(answer('exclusive', 'overage')).toContain('£0.20');
    expect(answer('exclusive', 'overage')).toContain('£0.02');
    expect(answer('inclusive', 'overage')).toContain('£0.24');
    expect(answer('inclusive', 'overage')).toContain('£0.024');
    expect(answer('exclusive', 'allowances')).toContain('1,000 AI WhatsApp replies');
    expect(answer('exclusive', 'annual')).toContain('10 per cent');
    expect(answer('inclusive', 'vat')).toContain('Prices include VAT at 20%.');
    expect(answer('not-registered', 'vat')).toContain('not VAT registered');
  });

  it('keeps voice minutes and WhatsApp replies separate in the allowance answer', () => {
    const answer =
      resolveFaq(pricingFaq, buildCopyContext()).find((item) => item.id === 'allowances')?.answer ??
      '';
    expect(answer).toMatch(
      /Starter: 200 voice minutes if you choose voice, or 1,000 AI WhatsApp replies/,
    );
    expect(answer).toMatch(/Pro: 500 voice minutes and 5,000 AI WhatsApp replies/);
    expect(answer).toMatch(/Premium: 1,200 voice minutes and 12,000 AI WhatsApp replies/);
  });
});
