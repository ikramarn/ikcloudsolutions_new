import type { Metadata } from 'next';
import { AgentSections } from '@/components/agents/AgentSections';
import { AgentsHero } from '@/components/agents/AgentsHero';
import { DemoWidgetLazy } from '@/components/agents/DemoWidgetLazy';
import { FaqSection } from '@/components/agents/FaqSection';
import { MetaFeesNote } from '@/components/agents/MetaFeesNote';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Button } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { Section } from '@/components/ui/Section';
import { getStartedHref } from '@/config/links';
import { whatsappFaq } from '@/content/agents/faq';
import { whatsappDemo, whatsappPage } from '@/content/agents/whatsapp';
import { serviceJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/ai-agents/whatsapp';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function WhatsAppPage() {
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <AgentsHero
        title={whatsappPage.h1}
        lead={whatsappPage.lead}
        secondary={{ label: 'See pricing', href: '/ai-agents/pricing' }}
      />
      <AgentSections sections={whatsappPage.sections} />
      <Section heading="WhatsApp fees from Meta" tone="surface">
        <MetaFeesNote />
      </Section>
      <Section heading={whatsappDemo.heading} intro={whatsappDemo.intro}>
        <DemoWidgetLazy scenarioId="general-whatsapp" />
      </Section>
      <FaqSection items={whatsappFaq} tone="surface" />
      <CtaBand
        heading="See it with your business details"
        body="Tell us about your business and we will set up a test conversation."
        actions={
          <>
            <Button href={getStartedHref({ channel: 'whatsapp' })}>
              Request your AI Front Desk
            </Button>
            <Button href="/ai-agents/voice" variant="secondary">
              See the voice receptionist
            </Button>
          </>
        }
      />
      <JsonLd
        data={serviceJsonLd({
          name: 'AI WhatsApp assistant',
          description: whatsappPage.lead,
          path: PATH,
          serviceType: 'AI WhatsApp assistant',
        })}
      />
    </>
  );
}
