import {
  pricingConfig,
  type Addon,
  type AddonId,
  type Channel,
  type Plan,
  type PlanId,
  type PricingConfig,
} from '@/config/pricing';
import {
  displayAmount,
  formatMoney,
  priceIn,
  vatNote,
  type BillingPeriod,
  type CurrencyCode,
  type PriceBook,
  type VatSettings,
} from '@/lib/money';

/** Annual plan fee in pence: the discount applies to the PLAN fee only. */
export function annualTotal(monthlyMinor: number, discountPercent: number): number {
  return Math.round((monthlyMinor * 12 * (100 - discountPercent)) / 100);
}

export function annualMonthlyEquivalent(annualMinor: number): number {
  return Math.round(annualMinor / 12);
}

export function annualSaving(monthlyMinor: number, discountPercent: number): number {
  return monthlyMinor * 12 - annualTotal(monthlyMinor, discountPercent);
}

export interface DisplayedPrice {
  /** Presented figure in pence (VAT mode applied). Per month, also for annual billing. */
  headline: number;
  perUnitLabel: string;
  billedLabel?: string;
  vatLabel: string;
  savingLabel?: string;
}

export function displayPrice(
  plan: Plan,
  period: BillingPeriod,
  currency: CurrencyCode,
  vat: VatSettings,
  discountPercent: number = pricingConfig.annualDiscountPercent,
): DisplayedPrice {
  const monthly = priceIn(plan.monthly, currency);
  const vatLabel = vatNote(vat.mode);
  if (period === 'monthly') {
    return { headline: displayAmount(monthly, vat), perUnitLabel: 'a month', vatLabel };
  }
  const yearly = displayAmount(annualTotal(monthly, discountPercent), vat);
  const saving = displayAmount(annualSaving(monthly, discountPercent), vat);
  return {
    headline: annualMonthlyEquivalent(yearly),
    perUnitLabel: 'a month',
    billedLabel: `billed ${formatMoney(yearly, currency, { dropZeroDecimals: true })} a year`,
    vatLabel,
    savingLabel: `save ${formatMoney(saving, currency, { dropZeroDecimals: true })} a year`,
  };
}

/**
 * Allowances that apply to an account. Voice minutes and WhatsApp replies are never combined.
 * Pro and Premium include both channels. Starter has one channel; the other is the
 * `second-channel` add-on (channel 'both' implies it, because estimateTotals adds it).
 */
export function effectiveAllowances(
  plan: Plan,
  channel: Channel,
  addonIds: readonly AddonId[],
): { voiceMinutes: number; whatsappAiReplies: number } {
  const { voiceMinutes, whatsappAiReplies } = plan.allowances;
  if (plan.channels === 'voice-and-whatsapp') return { voiceMinutes, whatsappAiReplies };

  const both = channel === 'both' || addonIds.includes('second-channel');
  const voice = both || channel === 'voice';
  const whatsapp = both || channel === 'whatsapp';
  return {
    voiceMinutes: voice ? voiceMinutes : 0,
    whatsappAiReplies: whatsapp ? whatsappAiReplies : 0,
  };
}

export interface EstimateSelection {
  planId: PlanId | 'not-sure';
  billing: BillingPeriod;
  channel: Channel;
  setupPreference: 'done-for-you' | 'self-serve-later';
  addonIds: readonly AddonId[];
}

/** All figures are NET pence. The VAT mode is applied afterwards by displayAmount. */
export interface EstimateTotals {
  planBilledNow: number;
  planMonthlyEquivalent: number;
  firstPayment: number;
  monthlyRecurring: number;
  oneTime: number;
  /** True when the one-time figure is a "from" price (Premium build). */
  oneTimeIsFrom: boolean;
  yearlyRecurring: number;
  currency: CurrencyCode;
  vatLabel: string;
  /** Add-ons that add nothing: coming soon, or not available on this plan. */
  ignored: AddonId[];
  /** Add-ons the plan needs (Starter with both channels needs the second channel). */
  autoAdded: AddonId[];
}

function isSelectable(addon: Addon | undefined, planId: PlanId): addon is Addon {
  if (!addon || addon.availability !== 'available') return false;
  return !addon.planRestriction || addon.planRestriction.includes(planId);
}

/** Indicative only, never a quote. Returns null when the visitor is not sure of a plan. */
export function estimateTotals(
  selection: EstimateSelection,
  cfg: PricingConfig = pricingConfig,
): EstimateTotals | null {
  if (selection.planId === 'not-sure') return null;
  const plan = cfg.plans.find((candidate) => candidate.id === selection.planId);
  if (!plan) return null;
  const currency = cfg.currency;

  const accepted: Addon[] = [];
  const ignored: AddonId[] = [];
  const autoAdded: AddonId[] = [];
  const seen = new Set<AddonId>();
  for (const id of selection.addonIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const addon = cfg.addons.find((candidate) => candidate.id === id);
    if (isSelectable(addon, plan.id)) accepted.push(addon);
    else ignored.push(id);
  }

  if (
    plan.id === 'starter' &&
    selection.channel === 'both' &&
    !accepted.some((addon) => addon.id === 'second-channel')
  ) {
    const second = cfg.addons.find((candidate) => candidate.id === 'second-channel');
    if (isSelectable(second, plan.id)) {
      accepted.push(second);
      autoAdded.push('second-channel');
    }
  }

  const monthly = priceIn(plan.monthly, currency);
  const planBilledNow =
    selection.billing === 'annual' ? annualTotal(monthly, cfg.annualDiscountPercent) : monthly;

  const sum = (pick: (addon: Addon) => PriceBook | undefined): number =>
    accepted.reduce((total, addon) => {
      const book = pick(addon);
      return book ? total + priceIn(book, currency) : total;
    }, 0);

  const addonOneTime = sum((addon) => addon.oneTime);
  const addonMonthly = sum((addon) => addon.monthly);
  const addonYearly = sum((addon) => addon.yearly);

  const doneForYou = selection.setupPreference === 'done-for-you';
  const oneTime = addonOneTime + (doneForYou ? priceIn(plan.setup.fee, currency) : 0);
  const monthlyRecurring = (selection.billing === 'monthly' ? monthly : 0) + addonMonthly;
  const yearlyRecurring = (selection.billing === 'annual' ? planBilledNow : 0) + addonYearly;

  return {
    planBilledNow,
    planMonthlyEquivalent:
      selection.billing === 'annual' ? annualMonthlyEquivalent(planBilledNow) : monthly,
    firstPayment: planBilledNow + oneTime + addonMonthly + addonYearly,
    monthlyRecurring,
    oneTime,
    oneTimeIsFrom: doneForYou && plan.setup.isFrom === true,
    yearlyRecurring,
    currency,
    vatLabel: vatNote(cfg.vat.mode),
    ignored,
    autoAdded,
  };
}

const ALLOWANCE_KEYS = [
  'voiceMinutes',
  'whatsappAiReplies',
  'agents',
  'integrations',
  'changeHoursPerMonth',
].sort();

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid pricing config: ${message}`);
}

function assertMinor(value: number, label: string): void {
  assert(Number.isInteger(value) && value > 0, `${label} must be a positive whole number`);
}

/** Invariants run in a unit test and at module load outside production. */
export function validatePricingConfig(cfg: PricingConfig): void {
  const currency = cfg.currency;
  assert(cfg.annualDiscountPercent >= 0 && cfg.annualDiscountPercent < 100, 'annual discount');
  assert(cfg.vat.ratePercent >= 0, 'VAT rate');

  const addonIds = cfg.addons.map((addon) => addon.id);
  assert(new Set(addonIds).size === addonIds.length, 'add-on ids must be unique');

  for (const plan of cfg.plans) {
    const monthly = priceIn(plan.monthly, currency);
    assertMinor(monthly, `${plan.id} monthly price`);
    assert(
      annualTotal(monthly, cfg.annualDiscountPercent) < monthly * 12,
      `${plan.id} annual total must be below twelve months`,
    );
    assertMinor(
      priceIn(plan.overage.voicePerMinuteTenthsPence, currency),
      `${plan.id} voice overage`,
    );
    assertMinor(
      priceIn(plan.overage.whatsappPerReplyTenthsPence, currency),
      `${plan.id} reply overage`,
    );
    assert(
      JSON.stringify(Object.keys(plan.allowances).sort()) === JSON.stringify(ALLOWANCE_KEYS),
      `${plan.id} allowances must be per-channel with no combined field`,
    );
    const pack = cfg.setupPackages.find((candidate) => candidate.id === plan.setup.packageId);
    assert(pack !== undefined, `${plan.id} setup package exists`);
    assert(
      priceIn(pack.fee, currency) === priceIn(plan.setup.fee, currency),
      `${plan.id} setup fee must match its package`,
    );
  }

  for (const pack of cfg.setupPackages) assertMinor(priceIn(pack.fee, currency), `${pack.id} fee`);

  for (const addon of cfg.addons) {
    const books = [addon.oneTime, addon.monthly, addon.yearly].filter(
      (book): book is PriceBook => book !== undefined,
    );
    assert(books.length > 0, `${addon.id} needs a price`);
    for (const book of books) assertMinor(priceIn(book, currency), `${addon.id} price`);
  }
}

if (process.env.NODE_ENV !== 'production') validatePricingConfig(pricingConfig);
