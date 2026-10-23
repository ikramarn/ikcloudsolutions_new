import type { Metadata } from 'next';
import { AddonsTable } from '@/components/agents/AddonsTable';
import { FaqSection } from '@/components/agents/FaqSection';
import { IncludedList } from '@/components/agents/IncludedList';
import { MetaFeesNote } from '@/components/agents/MetaFeesNote';
import { OverageTable } from '@/components/agents/OverageTable';
import { PricingTable } from '@/components/agents/PricingTable';
import { SetupPackages } from '@/components/agents/SetupPackages';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Button } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { getStartedHref } from '@/config/links';
import { pricingConfig } from '@/config/pricing';
import { pricingFaq } from '@/content/agents/faq';
import { vatPhrase } from '@/lib/money';
import { pricingServiceJsonLd } from '@/lib/seo/pricing-jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/ai-agents/pricing';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function PricingPage() {
  const vat = vatPhrase(pricingConfig.vat.mode, pricingConfig.vat.ratePercent);
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <PageHero
        eyebrow="AI Front Desk"
        title="AI Front Desk pricing"
        lead={
          <p>Flat monthly plan, a one-time setup fee, and clear overage. Prices in GBP. {vat}</p>
        }
      />
      <Section heading="Plans" tone="surface">
        <PricingTable />
        <Disclaimer variant="pricing-vat" className="mt-6">
          {vat} Voice minutes and AI WhatsApp replies are counted separately and never combined.
          Add-on prices are not changed by the billing toggle.
        </Disclaimer>
      </Section>
      <Section heading="Overage" intro="If you use more than your allowance, these rates apply.">
        <OverageTable />
      </Section>
      <Section
        heading="One-time setup"
        intro="Choose done-for-you set-up. Timelines are indicative. Self-serve set-up is coming with our customer app."
        tone="surface"
      >
        <SetupPackages />
      </Section>
      <Section heading="Add-ons">
        <AddonsTable />
      </Section>
      <Section heading="WhatsApp fees from Meta" tone="surface">
        <MetaFeesNote />
      </Section>
      <Section heading="What is included">
        <IncludedList />
      </Section>
      <FaqSection items={pricingFaq} tone="surface" />
      <CtaBand
        heading="Get an estimate for your business"
        body="The request form shows an indicative estimate and we confirm a quote before you pay anything."
        actions={
          <>
            <Button href={getStartedHref()}>Request your AI Front Desk</Button>
            <Button href="/ai-agents/done-for-you" variant="secondary">
              Done-for-you set-up
            </Button>
          </>
        }
      />
      <JsonLd data={pricingServiceJsonLd()} />
    </>
  );
}
