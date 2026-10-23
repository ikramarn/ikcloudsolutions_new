import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const cardVariants = cva('rounded-2xl p-6', {
  variants: {
    variant: {
      glass: 'glass-card',
      glow: 'glass-panel-glow',
      plain: 'border border-white/10 bg-surface',
    },
  },
  defaultVariants: { variant: 'glass' },
});

type CardProps<T extends ElementType> = VariantProps<typeof cardVariants> & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

export function Card<T extends ElementType = 'div'>({
  as,
  variant,
  className,
  ...props
}: CardProps<T>) {
  const Component: ElementType = as ?? 'div';
  return <Component className={cn(cardVariants({ variant }), className)} {...props} />;
}
