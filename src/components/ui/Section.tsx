import { useId, type ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';

type Tone = 'base' | 'surface' | 'glow';

const toneClasses: Record<Tone, string> = {
  base: 'bg-deep',
  surface: 'bg-surface',
  glow: 'bg-deep bg-glow-cyan',
};

interface SectionProps {
  id?: string;
  tone?: Tone;
  /** Renders the section's h2 and labels the section with it. */
  heading: string;
  eyebrow?: string;
  intro?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  tone = 'base',
  heading,
  eyebrow,
  intro,
  className,
  children,
}: SectionProps) {
  const headingId = useId();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn('scroll-mt-24 py-16 sm:py-20', toneClasses[tone], className)}
    >
      <Container>
        <div className="mb-10 max-w-3xl">
          {eyebrow ? (
            <p className="mb-2 font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            {heading}
          </h2>
          {intro ? <div className="mt-4 text-lg text-slate-300">{intro}</div> : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
