import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { displayAmount, formatMoney, priceIn, vatNote } from '@/lib/money';

/** One-time setup packages, fees and indicative timelines from config. */
export function SetupPackages({ config = pricingConfig }: { config?: PricingConfig }) {
  const { currency, vat } = config;
  const note = vatNote(vat.mode);
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {config.setupPackages.map((pack) => {
        const fee = formatMoney(displayAmount(priceIn(pack.fee, currency), vat), currency, {
          dropZeroDecimals: true,
        });
        return (
          <li key={pack.id}>
            <Card className="h-full">
              <h3 className="text-lg font-bold text-white">{pack.name}</h3>
              <p className="mt-2 text-2xl font-extrabold text-white">
                {pack.isFrom ? 'From ' : ''}
                {fee} <span className="text-base font-normal text-slate-300">one-time {note}</span>
              </p>
              <p className="mt-1 text-sm text-slate-300">{pack.typicalTimeline}</p>
              <ul className="mt-4 space-y-2">
                {pack.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-200">
                    <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
