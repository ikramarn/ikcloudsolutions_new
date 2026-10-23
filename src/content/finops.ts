// FinOps estimator inputs. Spend is in whole pounds; the saving percentage is an assumption the
// visitor controls, never a benchmark.
export const finopsInputs = {
  spend: { min: 5000, max: 250000, step: 1000, initial: 25000 },
  savingPercent: { min: 5, max: 50, step: 1, initial: 20 },
} as const;

export const finopsCaption =
  'An illustration based on the saving percentage you choose. It is not a quote or a benchmark, and nothing here is promised.';
