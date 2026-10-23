import type { ComponentPropsWithoutRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold tracking-wider uppercase',
  {
    variants: {
      tone: {
        new: 'bg-cyan-brand text-slate-950',
        demo: 'bg-violet-brand/25 text-violet-200',
        draft: 'bg-amber-400/20 text-amber-200',
        simulated: 'bg-blue-brand/25 text-blue-200',
        neutral: 'bg-white/10 text-slate-200',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

type BadgeProps = ComponentPropsWithoutRef<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ tone, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
