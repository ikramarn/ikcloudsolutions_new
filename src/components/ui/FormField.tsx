import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface FieldControlProps {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  'aria-required': true | undefined;
}

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Receives the ids and aria attributes to spread onto the control. */
  children: (control: FieldControlProps) => ReactNode;
}

/** Label, control, hint and error with ids wired automatically. */
export function FormField({ label, hint, error, required, className, children }: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-100">
        {label}
        {required ? <span className="font-normal text-slate-300"> (required)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-slate-300">
          {hint}
        </p>
      ) : null}
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {error ? (
        <p id={errorId} className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
