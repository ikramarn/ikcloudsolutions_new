import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type DisclaimerProps =
  | { variant: 'simulated' | 'ai-recording' | 'draft'; children?: ReactNode; className?: string }
  // VAT wording must come from the pricing config, so there is no default text for it.
  | { variant: 'pricing-vat'; children: ReactNode; className?: string };

const defaultText = {
  simulated:
    'This is a simulated example with a fictional business. It is not a recording of a real call or customer.',
  'ai-recording':
    'Calls handled by the AI receptionist may be recorded and transcribed. The AI always tells callers that it is an AI.',
  draft:
    'This page is a draft and has not yet been reviewed by a solicitor. Do not rely on it as legal advice.',
} as const;

export function Disclaimer(props: DisclaimerProps) {
  const text = props.variant === 'pricing-vat' ? undefined : defaultText[props.variant];
  return (
    <aside
      data-variant={props.variant}
      className={cn(
        'rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300',
        props.className,
      )}
    >
      {props.children ?? text}
    </aside>
  );
}
