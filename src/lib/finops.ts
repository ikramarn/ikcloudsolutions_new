import { finopsInputs } from '@/content/finops';
import { formatMoney } from '@/lib/money';

export interface FinopsEstimate {
  /** Whole pounds per month. */
  monthly: number;
  /** Whole pounds per year (twelve times the rounded monthly figure). */
  annual: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Spend in whole pounds, snapped to the slider range and step. */
export function clampSpend(value: number): number {
  const { min, max, step } = finopsInputs.spend;
  const snapped = min + Math.round((clamp(value, min, max) - min) / step) * step;
  return clamp(snapped, min, max);
}

/** Assumed saving as an integer percentage. */
export function clampSavingPercent(value: number): number {
  const { min, max } = finopsInputs.savingPercent;
  return clamp(Math.round(value), min, max);
}

export function estimateSaving(spendPounds: number, savingPercent: number): FinopsEstimate {
  const spend = clampSpend(spendPounds);
  const pct = clampSavingPercent(savingPercent);
  const monthly = Math.round((spend * pct) / 100);
  return { monthly, annual: monthly * 12 };
}

/** Whole pounds in, "£1,250" out. */
export function formatPounds(wholePounds: number): string {
  return formatMoney(wholePounds * 100, 'GBP', { dropZeroDecimals: true });
}
