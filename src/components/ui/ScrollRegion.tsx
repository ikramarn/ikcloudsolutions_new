import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ScrollRegionProps {
  /** Names the region for screen readers, for example "Add-ons and their prices". */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps wide content (tables) that scrolls sideways on narrow screens. It is focusable and named
 * so keyboard users can scroll it with the arrow keys.
 */
export function ScrollRegion({ label, children, className }: ScrollRegionProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        'overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-brand',
        className,
      )}
    >
      {children}
    </div>
  );
}
