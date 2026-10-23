import { finopsInputs } from '@/content/finops';
import { clampSavingPercent, clampSpend, estimateSaving, formatPounds } from '@/lib/finops';

describe('finops estimator', () => {
  it('computes whole-pound monthly and annual figures', () => {
    expect(estimateSaving(25000, 20)).toEqual({ monthly: 5000, annual: 60000 });
    expect(estimateSaving(5000, 5)).toEqual({ monthly: 250, annual: 3000 });
    expect(estimateSaving(250000, 50)).toEqual({ monthly: 125000, annual: 1500000 });
  });

  it('keeps inputs inside the slider range and step', () => {
    expect(clampSpend(0)).toBe(finopsInputs.spend.min);
    expect(clampSpend(999999)).toBe(finopsInputs.spend.max);
    expect(clampSpend(12400)).toBe(12000);
    expect(clampSavingPercent(1)).toBe(5);
    expect(clampSavingPercent(80)).toBe(50);
    expect(clampSavingPercent(20.4)).toBe(20);
  });

  it('formats whole pounds without decimals', () => {
    expect(formatPounds(5000)).toBe('£5,000');
    expect(formatPounds(1500000)).toBe('£1,500,000');
  });

  it('starts from the documented defaults', () => {
    expect(finopsInputs.savingPercent.initial).toBe(20);
    expect(finopsInputs.spend.min).toBe(5000);
    expect(finopsInputs.spend.max).toBe(250000);
    expect(finopsInputs.spend.step).toBe(1000);
  });
});
