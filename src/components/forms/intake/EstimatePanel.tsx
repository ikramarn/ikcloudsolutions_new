import { Badge } from '@/components/ui/Badge';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { displayAmount, formatMoney } from '@/lib/money';
import { estimateTotals, type EstimateSelection } from '@/lib/pricing';

interface EstimatePanelProps {
  /** Null until a plan and channel are chosen. */
  selection: EstimateSelection | null;
  config?: PricingConfig;
  /** Names of add-ons the estimate left out or added, for a short explanation. */
  addonNames?: Record<string, string>;
}

/**
 * An indicative estimate from the pricing config. Choosing "not sure" hides every figure, because
 * we would be guessing. Nothing here is a quote.
 */
export function EstimatePanel({
  selection,
  config = pricingConfig,
  addonNames,
}: EstimatePanelProps) {
  const totals = selection ? estimateTotals(selection, config) : null;
  const money = (net: number) =>
    formatMoney(displayAmount(net, config.vat), config.currency, { dropZeroDecimals: true });

  return (
    <section
      aria-labelledby="estimate-heading"
      className="glass-panel-glow space-y-3 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id="estimate-heading" className="text-lg font-bold text-white">
          Your estimate
        </h3>
        <Badge tone="neutral">Indicative</Badge>
      </div>
      {selection === null ? (
        <p className="text-slate-300">Choose a channel and a plan to see an estimate.</p>
      ) : totals === null ? (
        <p className="text-slate-300">
          You are not sure which plan suits you, so we show no figures. We will recommend a plan and
          confirm a quote before you pay anything.
        </p>
      ) : (
        <>
          <dl className="space-y-2 text-slate-200">
            <div className="flex justify-between gap-4">
              <dt>First payment</dt>
              <dd className="font-semibold text-white">
                {money(totals.firstPayment)} {totals.vatLabel}
              </dd>
            </div>
            {totals.monthlyRecurring > 0 ? (
              <div className="flex justify-between gap-4">
                <dt>Every month</dt>
                <dd className="font-semibold text-white">
                  {money(totals.monthlyRecurring)} {totals.vatLabel}
                </dd>
              </div>
            ) : null}
            {totals.yearlyRecurring > 0 ? (
              <div className="flex justify-between gap-4">
                <dt>Every year</dt>
                <dd className="font-semibold text-white">
                  {money(totals.yearlyRecurring)} {totals.vatLabel}
                </dd>
              </div>
            ) : null}
            {totals.oneTime > 0 ? (
              <div className="flex justify-between gap-4">
                <dt>One-time{totals.oneTimeIsFrom ? ' (from)' : ''}</dt>
                <dd className="font-semibold text-white">
                  {money(totals.oneTime)} {totals.vatLabel}
                </dd>
              </div>
            ) : null}
          </dl>
          {totals.autoAdded.length > 0 ? (
            <p className="text-sm text-slate-300">
              Included because your plan needs it:{' '}
              {totals.autoAdded.map((id) => addonNames?.[id] ?? id).join(', ')}.
            </p>
          ) : null}
          {totals.ignored.length > 0 ? (
            <p className="text-sm text-slate-300">
              Left out of the estimate:{' '}
              {totals.ignored.map((id) => addonNames?.[id] ?? id).join(', ')}.
            </p>
          ) : null}
        </>
      )}
      <p className="text-sm text-slate-300">
        Indicative only. We confirm a quote before you pay anything.
      </p>
    </section>
  );
}
