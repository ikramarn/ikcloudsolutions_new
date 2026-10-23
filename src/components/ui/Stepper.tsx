import { cn } from '@/lib/cn';

interface StepperProps {
  steps: readonly string[];
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <div className={className}>
      <p className="mb-3 text-sm font-semibold text-slate-200">
        Step {current + 1} of {steps.length}
      </p>
      <ol className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <li
            key={step}
            aria-current={index === current ? 'step' : undefined}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm',
              index === current
                ? 'border-cyan-brand bg-cyan-brand/10 font-semibold text-white'
                : 'border-white/10 text-slate-300',
            )}
          >
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
