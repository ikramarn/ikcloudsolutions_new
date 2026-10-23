import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { ScrollRegion } from '@/components/ui/ScrollRegion';
import { displayUnitRate, priceIn, vatPhrase } from '@/lib/money';

/** Overage rates, rendered through displayUnitRate so the VAT mode applies exactly. */
export function OverageTable({ config = pricingConfig }: { config?: PricingConfig }) {
  const { currency, vat, plans } = config;
  const rows = [
    {
      label: 'Each extra voice minute',
      rates: plans.map((plan) =>
        displayUnitRate(priceIn(plan.overage.voicePerMinuteTenthsPence, currency), vat),
      ),
    },
    {
      label: 'Each extra AI WhatsApp reply',
      rates: plans.map((plan) =>
        displayUnitRate(priceIn(plan.overage.whatsappPerReplyTenthsPence, currency), vat),
      ),
    },
  ];
  return (
    <ScrollRegion label="Overage rates by plan">
      <table className="w-full min-w-[32rem] text-left">
        <caption className="mb-3 text-left text-slate-300">
          Charged only for use above your monthly allowance. {vatPhrase(vat.mode, vat.ratePercent)}
        </caption>
        <thead>
          <tr className="border-b border-white/15 text-slate-200">
            <th scope="col" className="py-3 pr-4 font-semibold">
              Usage above your allowance
            </th>
            {plans.map((plan) => (
              <th key={plan.id} scope="col" className="py-3 pr-4 font-semibold">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-white/10 text-slate-200">
              <th scope="row" className="py-3 pr-4 font-normal">
                {row.label}
              </th>
              {row.rates.map((rate, index) => (
                <td key={plans[index]?.id ?? index} className="py-3 pr-4">
                  {rate}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}
