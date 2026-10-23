'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

// Structurally identical to BillingPeriod in src/lib/money.ts (FEAT-002).
type BillingPeriodValue = 'monthly' | 'annual';

interface PricingToggleProps {
  value: BillingPeriodValue;
  onChange: (value: BillingPeriodValue) => void;
  /** Generated from config (for example "Annual, save N%"), never typed by hand. */
  annualLabel: string;
  monthlyLabel?: string;
  className?: string;
}

/** Two native radios in a fieldset: arrow keys and grouping come from the browser. */
export function PricingToggle({
  value,
  onChange,
  annualLabel,
  monthlyLabel = 'Monthly',
  className,
}: PricingToggleProps) {
  const name = useId();
  const options: readonly { id: BillingPeriodValue; label: string }[] = [
    { id: 'monthly', label: monthlyLabel },
    { id: 'annual', label: annualLabel },
  ];
  return (
    <fieldset
      className={cn('inline-flex rounded-xl border border-white/10 bg-surface p-1', className)}
    >
      <legend className="sr-only">Billing period</legend>
      {options.map((option) => (
        <label
          key={option.id}
          className="relative inline-flex min-h-11 cursor-pointer items-center rounded-lg px-4 text-sm font-semibold text-slate-300 has-checked:bg-cyan-brand has-checked:text-slate-950 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-cyan-brand"
        >
          <input
            type="radio"
            name={name}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
