import { ArchitectureCard } from '@/components/home/ArchitectureCard';
import { ConsultationButton } from '@/components/forms/ConsultationButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { getStartedHref } from '@/config/links';
import { homeHero } from '@/content/home';

export function Hero() {
  return (
    <PageHero
      eyebrow={homeHero.eyebrow}
      title={homeHero.title}
      lead={
        <>
          <p>{homeHero.lead}</p>
          <ul aria-label="Capabilities" className="mt-5 flex flex-wrap gap-2">
            {homeHero.chips.map((chip) => (
              <li key={chip}>
                <Badge tone="neutral">{chip}</Badge>
              </li>
            ))}
          </ul>
        </>
      }
      actions={
        <>
          <Button href={getStartedHref()} size="lg">
            {homeHero.primaryCta}
            <Badge tone="neutral" className="bg-slate-950/20 text-slate-950">
              New
            </Badge>
          </Button>
          <ConsultationButton variant="secondary" size="lg">
            {homeHero.secondaryCta}
          </ConsultationButton>
          <Button href="/academy" variant="ghost" size="lg">
            {homeHero.academyLink}
          </Button>
        </>
      }
      aside={<ArchitectureCard />}
    />
  );
}
