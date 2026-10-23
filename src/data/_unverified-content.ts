// Archive of claims removed from the old site and the prototype. Nothing may import this file:
// ESLint (no-restricted-imports) and the claims-guard test both enforce it. FEAT-003 fills it in
// and docs/content-removed-report.md is generated from it.
export interface RemovedItem {
  readonly id: string;
  readonly kind: 'claim' | 'person' | 'metric' | 'logo' | 'feature';
  readonly original: string;
  readonly source: string;
  readonly reason: string;
}

export const removedContent: readonly RemovedItem[] = [];
