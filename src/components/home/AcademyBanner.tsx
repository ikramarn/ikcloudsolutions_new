import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { academyBanner } from '@/content/home';

export function AcademyBanner() {
  return (
    <section aria-labelledby="academy-banner-heading" className="bg-deep py-16">
      <Container>
        <div className="glass-card flex flex-col gap-6 rounded-2xl p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Badge tone="demo">{academyBanner.eyebrow}</Badge>
            <h2 id="academy-banner-heading" className="mt-3 text-2xl font-extrabold text-white">
              {academyBanner.heading}
            </h2>
            <p className="mt-2 text-slate-300">{academyBanner.body}</p>
          </div>
          <Button href="/academy" variant="secondary">
            {academyBanner.cta}
          </Button>
        </div>
      </Container>
    </section>
  );
}
