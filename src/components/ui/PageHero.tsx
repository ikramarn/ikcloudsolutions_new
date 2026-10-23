import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}

/** The only place an h1 is produced on marketing pages. */
export function PageHero({ eyebrow, title, lead, actions, aside }: PageHeroProps) {
  return (
    <section className="cyber-grid bg-glow-cyan relative py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            {eyebrow ? (
              <p className="mb-3 font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            {lead ? <div className="mt-5 max-w-2xl text-lg text-slate-300">{lead}</div> : null}
            {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {aside ? <div>{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}
