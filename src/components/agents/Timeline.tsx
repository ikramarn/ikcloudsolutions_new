import type { AgentFeature } from '@/content/agents/sections';

/** A vertical ordered list for the done-for-you process. */
export function Timeline({ steps }: { steps: readonly AgentFeature[] }) {
  return (
    <ol className="space-y-4 border-l border-white/15 pl-6">
      {steps.map((step, index) => (
        <li key={step.title} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-1 -left-[2.1rem] inline-flex size-6 items-center justify-center rounded-full bg-cyan-brand font-mono text-xs font-bold text-slate-950"
          >
            {index + 1}
          </span>
          <h3 className="text-lg font-bold text-white">
            <span className="sr-only">Step {index + 1}: </span>
            {step.title}
          </h3>
          <p className="mt-1 text-slate-300">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
