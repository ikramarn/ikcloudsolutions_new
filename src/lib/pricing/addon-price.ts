import type { Addon, PricingConfig } from '@/config/pricing';
import { displayAmount, formatMoney, priceIn, vatNote, type PriceBook } from '@/lib/money';

/**
 * Each figure goes through displayAmount and the VAT note, and is labelled one-time, per month or
 * per year, for example a one-time price followed by a monthly price. Add-ons are never
 * discounted.
 */
export function addonPriceText(addon: Addon, config: PricingConfig): string {
  const { currency, vat } = config;
  const note = vatNote(vat.mode);
  const show = (book: PriceBook | undefined, unit: string): string | null =>
    book
      ? [
          formatMoney(displayAmount(priceIn(book, currency), vat), currency, {
            dropZeroDecimals: true,
          }),
          unit,
          note,
        ]
          .filter(Boolean)
          .join(' ')
      : null;
  return [
    show(addon.oneTime, 'one-time'),
    show(addon.monthly, 'per month'),
    show(addon.yearly, 'per year'),
  ]
    .filter((part): part is string => part !== null)
    .join(' and ');
}
