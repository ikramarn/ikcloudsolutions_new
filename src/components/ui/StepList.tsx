import type { ReactNode } from 'react';

export interface Step {
  title: string;
  description: ReactNode;
}

/** Headings are h3: the surrounding Section provides the h2. */
export function StepList({ steps }: { steps: readonly Step[] }) {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.title} className="glass-card rounded-2xl p-6">
          <span
            aria-hidden="true"
            className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-cyan-brand font-mono text-sm font-bold text-slate-950"
          >
            {index + 1}
          </span>
          <h3 className="text-lg font-bold text-white">
            <span className="sr-only">Step {index + 1}: </span>
            {step.title}
          </h3>
          <div className="mt-2 text-slate-300">{step.description}</div>
        </li>
      ))}
    </ol>
  );
}
