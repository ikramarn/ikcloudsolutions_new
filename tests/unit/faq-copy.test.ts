import { pricingConfig, type PricingConfig } from '@/config/pricing';
import type { VatMode } from '@/lib/money';
import {
  buildCopyContext,
  parseLinkTokens,
  resolveFaq,
  stripLinkTokens,
  type FaqItem,
} from '@/lib/copy/faq';
import { hubFaq, howItWorksFaq, pricingFaq, voiceFaq, whatsappFaq } from '@/content/agents/faq';
import { industries } from '@/content/agents/industries';
import { faqJsonLd } from '@/lib/seo/jsonld';

const modes: VatMode[] = ['exclusive', 'inclusive', 'not-registered'];

function withMode(mode: VatMode): PricingConfig {
  return { ...pricingConfig, vat: { mode, ratePercent: 20 } };
}

// Representative items: real FAQ arrays are added to this list as pages are built.
const sampleFaq: readonly FaqItem[] = [
  {
    id: 'overage',
    question: 'What happens if I go over my allowance?',
    answer: (c) =>
      `Extra voice minutes cost ${c.unitRate(
        c.pricing.plans[0].overage.voicePerMinuteTenthsPence.GBP,
      )} each and extra AI replies cost ${c.unitRate(
        c.pricing.plans[0].overage.whatsappPerReplyTenthsPence.GBP,
      )} each. ${c.vatPhrase}`,
  },
  {
    id: 'starting-price',
    question: 'How much does it cost?',
    answer: (c) =>
      `Plans start from ${c.displayPrice('starter', 'monthly')}. See {{link:/ai-agents/pricing|the pricing page}} for the rest.`,
  },
  {
    id: 'static',
    question: 'Do I need a website?',
    answer: 'No. We can build a small one for you.',
  },
];

describe.each(modes)('FAQ copy in %s VAT mode', (mode) => {
  const ctx = buildCopyContext(withMode(mode));
  const resolved = resolveFaq(sampleFaq, ctx);

  it('resolves every answer to non-empty text with no leftovers', () => {
    for (const item of resolved) {
      const text = stripLinkTokens(item.answer);
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toContain('{{');
      expect(text).not.toContain('undefined');
      expect(text).not.toContain('NaN');
    }
  });

  it('feeds JSON-LD answers equal to the resolved answers after token stripping', () => {
    // schema-dts return types are unions with strings, so read the serialised form instead.
    const jsonLd = JSON.parse(JSON.stringify(faqJsonLd(resolved))) as {
      mainEntity: { acceptedAnswer: { text: string } }[];
    };
    const answers = jsonLd.mainEntity.map((entity) => entity.acceptedAnswer.text);
    expect(answers).toEqual(resolved.map((item) => stripLinkTokens(item.answer)));
  });
});

describe('FAQ copy follows the VAT mode', () => {
  const overage = (mode: VatMode) =>
    resolveFaq(sampleFaq, buildCopyContext(withMode(mode)))[0]!.answer;

  it('shows inclusive rates with VAT applied', () => {
    expect(overage('inclusive')).toContain('£0.24');
    expect(overage('inclusive')).toContain('£0.024');
    expect(overage('inclusive')).toContain('Prices include VAT at 20%.');
  });

  it('shows net rates otherwise', () => {
    expect(overage('exclusive')).toContain('£0.20');
    expect(overage('exclusive')).toContain('£0.02 ');
    expect(overage('not-registered')).toContain('£0.20');
  });

  it('prices the starting plan per mode', () => {
    const start = (mode: VatMode) =>
      buildCopyContext(withMode(mode)).displayPrice('starter', 'monthly');
    expect(start('exclusive')).toBe('£79 a month + VAT');
    expect(start('inclusive')).toBe('£94.80 a month inc. VAT');
    expect(start('not-registered')).toBe('£79 a month');
  });
});

describe('link tokens', () => {
  it('parses text and links in order', () => {
    expect(parseLinkTokens('See {{link:/a|this page}} now.')).toEqual([
      { kind: 'text', value: 'See ' },
      { kind: 'link', href: '/a', label: 'this page' },
      { kind: 'text', value: ' now.' },
    ]);
  });

  it('strips tokens down to their label', () => {
    expect(stripLinkTokens('A {{link:/a|b}} and {{link:/c|d}}.')).toBe('A b and d.');
  });
});

// Every real page FAQ: the same resolved array drives the Accordion and the FAQPage JSON-LD.
const realFaqs: Record<string, readonly FaqItem[]> = {
  hub: hubFaq,
  pricing: pricingFaq,
  voice: voiceFaq,
  whatsapp: whatsappFaq,
  'how-it-works': howItWorksFaq,
  ...Object.fromEntries(industries.map((industry) => [industry.slug, industry.faq])),
};

describe.each(modes)('real page FAQs in %s VAT mode', (mode) => {
  const ctx = buildCopyContext(withMode(mode));

  it.each(Object.entries(realFaqs))(
    '%s: JSON-LD answers equal resolved answers',
    (_name, items) => {
      const resolved = resolveFaq(items, ctx);
      const jsonLd = JSON.parse(JSON.stringify(faqJsonLd(resolved))) as {
        mainEntity: { name: string; acceptedAnswer: { text: string } }[];
      };
      expect(jsonLd.mainEntity.map((entity) => entity.name)).toEqual(
        resolved.map((item) => item.question),
      );
      expect(jsonLd.mainEntity.map((entity) => entity.acceptedAnswer.text)).toEqual(
        resolved.map((item) => stripLinkTokens(item.answer)),
      );
    },
  );
});

describe('the pricing FAQ follows the VAT mode', () => {
  const overage = (mode: VatMode) =>
    resolveFaq(pricingFaq, buildCopyContext(withMode(mode))).find((item) => item.id === 'overage')
      ?.answer;

  it('shows inclusive rates with VAT applied', () => {
    expect(overage('inclusive')).toContain('£0.24');
    expect(overage('inclusive')).toContain('£0.024');
  });

  it('shows net rates otherwise', () => {
    expect(overage('exclusive')).toContain('£0.20');
    expect(overage('not-registered')).toContain('£0.20');
  });
});
