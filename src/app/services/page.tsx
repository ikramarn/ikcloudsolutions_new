import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { accentText } from '@/components/home/ServicesGrid';
import { FinOpsEstimator } from '@/components/home/FinOpsEstimator';
import { ConsultationButton } from '@/components/forms/ConsultationButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { getStartedHref } from '@/config/links';
import { finopsSection } from '@/content/home';
import { services, servicesPage } from '@/content/services';
import { serviceListJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/services';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function ServicesPage() {
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <PageHero title={servicesPage.title} lead={servicesPage.lead} />
      <Section heading={servicesPage.frontDeskCard.heading} tone="surface">
        <div className="glass-panel-glow flex flex-col gap-6 rounded-2xl p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Badge tone="new">New</Badge>
            <p className="mt-3 text-lg text-slate-200">{servicesPage.frontDeskCard.body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/ai-agents">Explore the AI Front Desk</Button>
            <Button href={getStartedHref()} variant="secondary">
              Request your AI Front Desk
            </Button>
          </div>
        </div>
      </Section>
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <Section
            key={service.id}
            id={service.id}
            tone={index % 2 === 0 ? 'base' : 'surface'}
            heading={service.title}
            intro={service.tagline}
          >
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <Icon aria-hidden="true" className={`mb-4 size-8 ${accentText[service.accent]}`} />
                <p className="text-lg text-slate-200">{service.description}</p>
              </div>
              <ul className="space-y-3">
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-slate-200">
                    <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        );
      })}
      <Section
        id="finops-estimator"
        tone="surface"
        heading={finopsSection.heading}
        intro={finopsSection.intro}
      >
        <FinOpsEstimator />
      </Section>
      <CtaBand
        heading="Talk to us about your cloud"
        body="Tell us what you are working on and we will reply by email."
        actions={
          <>
            <Button href="/contact">Contact us</Button>
            <ConsultationButton variant="secondary">Book a consultation</ConsultationButton>
          </>
        }
      />
      <JsonLd
        data={serviceListJsonLd(
          services.map((service) => ({
            name: service.title,
            description: service.description,
            path: `${PATH}#${service.id}`,
            serviceType: service.title,
          })),
        )}
      />
    </>
  );
}
