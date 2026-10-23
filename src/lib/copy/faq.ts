import { pricingConfig, type PlanId, type PricingConfig } from '@/config/pricing';
import {
  displayAmount,
  displayUnitRate,
  formatMoney,
  vatNote,
  vatPhrase,
  type BillingPeriod,
} from '@/lib/money';
import { displayPrice } from '@/lib/pricing';

/**
 * Everything FAQ, hub and teaser copy may say about money comes through this context, so no
 * price, allowance or VAT phrase is ever typed into copy.
 */
export interface CopyContext {
  pricing: PricingConfig;
  /** NET pence in, presented figure out (VAT mode applied, whole pounds without decimals). */
  money: (minor: number) => string;
  /** Overage rate in tenths of a penny, presented through the VAT mode. */
  unitRate: (tenths: number) => string;
  vatNote: string;
  vatPhrase: string;
  displayPrice: (planId: PlanId, period: BillingPeriod) => string;
}

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string | ((c: CopyContext) => string);
}

export interface ResolvedFaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export function buildCopyContext(pricing: PricingConfig = pricingConfig): CopyContext {
  const { currency, vat } = pricing;
  return {
    pricing,
    money: (minor) => formatMoney(displayAmount(minor, vat), currency, { dropZeroDecimals: true }),
    unitRate: (tenths) => displayUnitRate(tenths, vat),
    vatNote: vatNote(vat.mode),
    vatPhrase: vatPhrase(vat.mode, vat.ratePercent),
    displayPrice: (planId, period) => {
      const plan = pricing.plans.find((candidate) => candidate.id === planId);
      if (!plan) throw new Error(`Unknown plan "${planId}".`);
      const shown = displayPrice(plan, period, currency, vat, pricing.annualDiscountPercent);
      const amount = formatMoney(shown.headline, currency, { dropZeroDecimals: true });
      return [amount, shown.perUnitLabel, shown.vatLabel].filter(Boolean).join(' ');
    },
  };
}

/** Call ONCE per page and pass the same array to the Accordion and to faqJsonLd. */
export function resolveFaq(
  items: readonly FaqItem[],
  ctx: CopyContext,
): readonly ResolvedFaqItem[] {
  return items.map((item) => ({
    id: item.id,
    question: item.question,
    answer: typeof item.answer === 'function' ? item.answer(ctx) : item.answer,
  }));
}

export { parseLinkTokens, stripLinkTokens } from '@/lib/copy/link-tokens';
