import { pricingConfig, type Addon, type AddonId, type PricingConfig } from '@/config/pricing';
import { displayAmount, formatMoney, priceIn, vatNote } from '@/lib/money';

function priceParts(addon: Addon, config: PricingConfig): string[] {
  const { currency, vat } = config;
  const note = vatNote(vat.mode);
  const show = (book: Addon['oneTime'], unit: string): string | null =>
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
  ].filter((part): part is string => part !== null);
}

/**
 * Add-on prices are never discounted by the annual toggle. Each is labelled one-time, per month or
 * per year. Coming-soon items show no price commitment.
 */
interface AddonsTableProps {
  config?: PricingConfig;
  /** Show only these add-ons (for example the website and domain on the websites page). */
  only?: readonly AddonId[];
}

export function AddonsTable({ config = pricingConfig, only }: AddonsTableProps) {
  const addons = only ? config.addons.filter((addon) => only.includes(addon.id)) : config.addons;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left">
        <caption className="sr-only">Add-ons and their prices</caption>
        <thead>
          <tr className="border-b border-white/15 text-slate-200">
            <th scope="col" className="py-3 pr-4 font-semibold">
              Add-on
            </th>
            <th scope="col" className="py-3 pr-4 font-semibold">
              Price
            </th>
            <th scope="col" className="py-3 pr-4 font-semibold">
              Availability
            </th>
          </tr>
        </thead>
        <tbody>
          {addons.map((addon) => {
            const comingSoon = addon.availability === 'coming-soon';
            return (
              <tr key={addon.id} className="border-b border-white/10 align-top text-slate-200">
                <th scope="row" className="py-3 pr-4 font-normal">
                  <span className="font-semibold text-white">{addon.name}</span>
                  <span className="mt-1 block text-sm text-slate-300">{addon.description}</span>
                  {addon.note ? (
                    <span className="mt-1 block text-sm text-slate-300">{addon.note}</span>
                  ) : null}
                </th>
                <td className="py-3 pr-4">
                  {comingSoon ? 'To be confirmed' : priceParts(addon, config).join(' and ')}
                </td>
                <td className="py-3 pr-4">
                  {comingSoon
                    ? 'Coming soon'
                    : addon.planRestriction
                      ? `${addon.planRestriction.map((id) => config.plans.find((plan) => plan.id === id)?.name ?? id).join(', ')} only`
                      : 'Available'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
