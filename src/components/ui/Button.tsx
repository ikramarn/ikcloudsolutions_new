import Link from 'next/link';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { asRoute, isExternalCta } from '@/config/links';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'glow-button text-slate-950',
        secondary:
          'border border-white/15 bg-white/5 text-slate-100 hover:border-cyan-brand/50 hover:bg-white/10',
        ghost: 'text-slate-200 hover:bg-white/10',
        violet: 'glow-button-purple text-white',
      },
      size: {
        sm: 'min-h-10 px-3 text-sm',
        md: 'min-h-11 px-5 text-sm',
        lg: 'min-h-12 px-7 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface BaseProps extends VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
    ref?: Ref<HTMLButtonElement>;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'href'> & {
    href: string;
    ref?: Ref<HTMLAnchorElement>;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant, size, className, asChild, loading, children, ...rest } = props;
  const classes = cn(buttonVariants({ variant, size }), className);

  if (typeof rest.href === 'string') {
    const { href, ref, rel, ...anchor } = rest as Omit<ButtonAsLink, keyof BaseProps>;
    if (isExternalCta(href)) {
      return (
        <a ref={ref} href={href} rel={rel ?? 'noopener'} className={classes} {...anchor}>
          {children}
        </a>
      );
    }
    // The only Route cast for CTAs: internal hrefs may carry hashes or queries (see asRoute).
    return (
      <Link ref={ref} href={asRoute(href)} rel={rel} className={classes} {...anchor}>
        {children}
      </Link>
    );
  }

  const { ref, disabled, type, ...button } = rest as Omit<ButtonAsButton, keyof BaseProps>;
  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...button}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...button}
    >
      {children}
    </button>
  );
}
