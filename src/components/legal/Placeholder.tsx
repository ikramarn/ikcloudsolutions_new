import type { ReactNode } from 'react';

/**
 * A value the owner or solicitor still has to supply. Rendered with square brackets and a visible
 * highlight (not colour alone) so a placeholder cannot reach customers unnoticed.
 */
export function Ph({ children }: { children: ReactNode }) {
  return (
    <mark
      data-placeholder
      className="rounded bg-amber-300/25 px-1 font-semibold text-amber-100 ring-1 ring-amber-300/50"
    >
      [{children}]
    </mark>
  );
}
