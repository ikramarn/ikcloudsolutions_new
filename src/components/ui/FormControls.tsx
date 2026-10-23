import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const controlClasses =
  'block min-h-11 w-full rounded-lg border border-white/15 bg-surface px-3 py-2 text-base text-white placeholder:text-slate-400 aria-[invalid=true]:border-red-400';

export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return <input className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentPropsWithRef<'textarea'>) {
  return <textarea className={cn(controlClasses, 'min-h-32', className)} {...props} />;
}

export function Select({ className, ...props }: ComponentPropsWithRef<'select'>) {
  return <select className={cn(controlClasses, className)} {...props} />;
}

interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'> {
  label: ReactNode;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  return (
    <label className="flex min-h-11 items-start gap-3 text-slate-200">
      <input
        type="checkbox"
        id={id}
        className={cn('mt-1 size-5 shrink-0 accent-cyan-400', className)}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

interface RadioOption {
  value: string;
  label: ReactNode;
}

interface RadioGroupProps {
  name: string;
  legend: string;
  options: readonly RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export function RadioGroup({
  name,
  legend,
  options,
  value,
  onChange,
  required,
  error,
  className,
}: RadioGroupProps) {
  return (
    <fieldset className={cn('space-y-1', className)} aria-invalid={error ? true : undefined}>
      <legend className="mb-2 text-sm font-semibold text-slate-100">
        {legend}
        {required ? <span className="text-slate-300"> (required)</span> : null}
      </legend>
      {options.map((option) => (
        <label key={option.value} className="flex min-h-11 items-center gap-3 text-slate-200">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === undefined ? undefined : value === option.value}
            onChange={() => onChange?.(option.value)}
            required={required}
            className="size-5 shrink-0 accent-cyan-400"
          />
          <span>{option.label}</span>
        </label>
      ))}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </fieldset>
  );
}
