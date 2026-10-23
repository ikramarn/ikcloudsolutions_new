import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';

interface CtaBandProps {
  heading: string;
  body?: ReactNode;
  actions: ReactNode;
}

export function CtaBand({ heading, body, actions }: CtaBandProps) {
  return (
    <section aria-label={heading} className="bg-surface py-16">
      <Container>
        <div className="glass-panel-glow flex flex-col gap-6 rounded-2xl p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{heading}</h2>
            {body ? <div className="mt-2 text-slate-300">{body}</div> : null}
          </div>
          <div className="flex flex-wrap gap-3">{actions}</div>
        </div>
      </Container>
    </section>
  );
}
