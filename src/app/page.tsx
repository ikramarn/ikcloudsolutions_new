import type { Metadata } from 'next';
import { AboutTeaser } from '@/components/home/AboutTeaser';
import { AcademyBanner } from '@/components/home/AcademyBanner';
import { AgentsTeaser } from '@/components/home/AgentsTeaser';
import { FinOpsEstimator } from '@/components/home/FinOpsEstimator';
import { Hero } from '@/components/home/Hero';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { ConsultationButton } from '@/components/forms/ConsultationButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { Section } from '@/components/ui/Section';
import { finopsSection, homeCta, servicesSection } from '@/content/home';
import { professionalServiceJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildRouteMetadata('/');

export default function HomePage() {
  return (
    <>
      <Hero />
      <AgentsTeaser />
      <Section heading={servicesSection.heading} intro={servicesSection.intro}>
        <ServicesGrid />
      </Section>
      <Section
        id="finops-estimator"
        tone="surface"
        heading={finopsSection.heading}
        intro={finopsSection.intro}
      >
        <FinOpsEstimator />
      </Section>
      <AcademyBanner />
      <AboutTeaser />
      <CtaBand
        heading={homeCta.heading}
        body={homeCta.body}
        actions={
          <>
            <Button href="/contact">{homeCta.primary}</Button>
            <ConsultationButton variant="secondary">{homeCta.secondary}</ConsultationButton>
          </>
        }
      />
      <JsonLd data={professionalServiceJsonLd()} />
    </>
  );
}
