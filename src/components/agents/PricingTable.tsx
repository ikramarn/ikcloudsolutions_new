'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PricingToggle } from '@/components/ui/PricingToggle';
import { getStartedHref } from '@/config/links';
import { pricingConfig, type Plan, type PricingConfig } from '@/config/pricing';
import { displayAmount, formatMoney, priceIn, type BillingPeriod } from '@/lib/money';
import { displayPrice } from '@/lib/pricing';

const count = (value: number): string => value.toLocaleString('en-GB');

interface PlanCardProps {
  plan: Plan;
  period: BillingPeriod;
  config: PricingConfig;
}

/**
 * Voice minutes and AI WhatsApp replies are always separate lines. Starter's lines are
 * conditional on the channel chosen; Pro and Premium include both unconditionally.
 */
function PlanCard({ plan, period, config }: PlanCardProps) {
  const { currency, vat, annualDiscountPercent } = config;
  const shown = displayPrice(plan, period, currency, vat, annualDiscountPercent);
  const setupFee = formatMoney(displayAmount(priceIn(plan.setup.fee, currency), vat), currency, {
    dropZeroDecimals: true,
  });
  const { voiceMinutes, whatsappAiReplies, agents, integrations, changeHoursPerMonth } =
    plan.allowances;
  const conditional = plan.channels === 'one-of-voice-or-whatsapp';
  return (
    <li>
      <Card variant={plan.featured ? 'glow' : 'glass'} className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
          {plan.featured ? <Badge tone="new">Both channels</Badge> : null}
        </div>
        <p className="mt-1 text-slate-300">{plan.summary}</p>
        <p className="mt-4 text-4xl font-extrabold text-white">
          {formatMoney(shown.headline, currency, { dropZeroDecimals: true })}
        </p>
        <p className="text-slate-300">
          {shown.perUnitLabel} {shown.vatLabel}
        </p>
        {shown.billedLabel ? (
          <p className="mt-1 text-sm text-slate-200">{shown.billedLabel}</p>
        ) : null}
        {shown.savingLabel ? (
          <p className="text-sm font-semibold text-emerald-300">{shown.savingLabel}</p>
        ) : null}
        <ul aria-label={`${plan.name} allowances`} className="mt-5 space-y-2 text-slate-200">
          <li>
            Voice minutes: {count(voiceMinutes)} a month
            {conditional ? ' if you choose voice' : ''}
          </li>
          <li>
            AI WhatsApp replies: {count(whatsappAiReplies)} a month
            {conditional ? ' if you choose WhatsApp' : ''}
          </li>
        </ul>
        {conditional ? (
          <p className="mt-2 text-sm text-slate-300">
            The other channel is the second-channel add-on.
          </p>
        ) : null}
        <ul className="mt-4 flex-1 space-y-2">
          {[
            `${agents} ${agents === 1 ? 'agent' : 'agents'}`,
            `${integrations} ${integrations === 1 ? 'integration' : 'integrations'}`,
            ...(changeHoursPerMonth > 0
              ? [
                  `${changeHoursPerMonth} ${changeHoursPerMonth === 1 ? 'change hour' : 'change hours'} a month`,
                ]
              : []),
            plan.support,
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-200">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-300">
          Setup {plan.setup.isFrom ? 'from ' : ''}
          {setupFee} one-time {shown.vatLabel}
        </p>
        <div className="mt-4">
          <Button href={getStartedHref({ plan: plan.id, billing: period })} className="w-full">
            Choose {plan.name}
          </Button>
        </div>
      </Card>
    </li>
  );
}

interface PricingTableProps {
  config?: PricingConfig;
}

/** The billing toggle and the three plan cards. All figures come from the pricing config. */
export function PricingTable({ config = pricingConfig }: PricingTableProps) {
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  return (
    <div className="space-y-8">
      <PricingToggle
        value={period}
        onChange={setPeriod}
        annualLabel={`Annual, save ${config.annualDiscountPercent}%`}
      />
      <ul className="grid gap-6 lg:grid-cols-3">
        {config.plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} period={period} config={config} />
        ))}
      </ul>
    </div>
  );
}
