import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { agentsTeaser } from '@/content/home';
import { buildCopyContext } from '@/lib/copy/faq';

/** The price comes from the copy context, so it follows the pricing config and VAT mode. */
export function AgentsTeaser() {
  const ctx = buildCopyContext();
  return (
    <section aria-labelledby="agents-teaser-heading" className="bg-surface py-16 sm:py-20">
      <Container>
        <div className="glass-panel-glow grid gap-8 rounded-2xl p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge tone="new">{agentsTeaser.eyebrow}</Badge>
            <h2
              id="agents-teaser-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            >
              {agentsTeaser.heading}
            </h2>
            <p className="mt-4 text-lg text-slate-300">{agentsTeaser.lead}</p>
            <p className="mt-4 font-semibold text-white">
              {agentsTeaser.priceLead} {ctx.displayPrice('starter', 'monthly')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/ai-agents">Explore the AI Front Desk</Button>
              <Button href="/ai-agents/pricing" variant="secondary">
                See pricing
              </Button>
            </div>
          </div>
          <ul className="space-y-3">
            {agentsTeaser.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-slate-200">
                <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
