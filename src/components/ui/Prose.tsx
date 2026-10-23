import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

/** Typographic wrapper for long-form text such as legal pages. */
export function Prose({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'max-w-3xl space-y-4 text-base leading-relaxed text-slate-300',
        '[&_a]:text-cyan-300 [&_a]:underline [&_a]:underline-offset-2',
        '[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white',
        '[&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white',
        '[&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc',
        '[&_strong]:text-white',
        className,
      )}
      {...props}
    />
  );
}
