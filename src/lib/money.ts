// All amounts are integers in minor units (pence), never floats. Stored prices are NET; the VAT
// mode only changes how a net figure is presented.

/**
 * UK-only build. Adding a second currency later is a one-line change here: PriceBook is a mapped
 * type with a REQUIRED key per currency, so `tsc` then fails on every price until an amount in
 * the new currency is supplied. The seam is the type, not data.
 */
export type CurrencyCode = 'GBP';
export type BillingPeriod = 'monthly' | 'annual';
export type VatMode = 'exclusive' | 'inclusive' | 'not-registered';
export type PriceBook = { readonly [C in CurrencyCode]: number };

export interface VatSettings {
  readonly mode: VatMode;
  readonly ratePercent: number;
}

export function priceIn(book: PriceBook, currency: CurrencyCode): number {
  return book[currency];
}

/** 7110 -> "£71.10"; with dropZeroDecimals 7900 -> "£79" while 7110 stays "£71.10". */
export function formatMoney(
  minor: number,
  currency: CurrencyCode,
  opts?: { dropZeroDecimals?: boolean },
): string {
  const whole = opts?.dropZeroDecimals === true && minor % 100 === 0;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(minor / 100);
}

/** For amounts in PENCE: Math.round(minor * (100 + rate) / 100). */
export function addVat(minor: number, ratePercent: number): number {
  return Math.round((minor * (100 + ratePercent)) / 100);
}

/**
 * Unit rates (overage) are stored in TENTHS of a penny so inclusive VAT stays exact.
 * Whole pence render with 2 decimals, anything else with 3: 20 -> "£0.02", 24 -> "£0.024",
 * 200 -> "£0.20". Zero, negative or non-integer input throws.
 */
export function formatPoundsFromTenths(tenthsPence: number): string {
  if (!Number.isInteger(tenthsPence) || tenthsPence <= 0) {
    throw new RangeError(
      `Unit rate must be a positive whole number of tenths, got ${tenthsPence}.`,
    );
  }
  const digits = tenthsPence % 10 === 0 ? 2 : 3;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(tenthsPence / 1000);
}

export function displayUnitRate(tenthsPence: number, vat: VatSettings): string {
  const shown =
    vat.mode === 'inclusive'
      ? Math.round((tenthsPence * (100 + vat.ratePercent)) / 100)
      : tenthsPence;
  return formatPoundsFromTenths(shown);
}

/** The short note that follows a price. */
export function vatNote(mode: VatMode): string {
  if (mode === 'exclusive') return '+ VAT';
  if (mode === 'inclusive') return 'inc. VAT';
  return '';
}

/** Sentence form for prose and meta text. */
export function vatPhrase(mode: VatMode, ratePercent = 20): string {
  if (mode === 'exclusive') return 'Prices exclude VAT (shown as + VAT).';
  if (mode === 'inclusive') return `Prices include VAT at ${ratePercent}%.`;
  return 'We are not VAT registered, so no VAT is added.';
}

/** Decimal string for structured data: 9480 -> "94.80". Integer pence only. */
export function decimalFromMinor(minor: number): string {
  if (!Number.isInteger(minor) || minor < 0) {
    throw new RangeError(`Amount must be a non-negative whole number of pence, got ${minor}.`);
  }
  return `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, '0')}`;
}

/** Presented figure for a NET amount in pence. */
export function displayAmount(netMinor: number, vat: VatSettings): number {
  return vat.mode === 'inclusive' ? addVat(netMinor, vat.ratePercent) : netMinor;
}
