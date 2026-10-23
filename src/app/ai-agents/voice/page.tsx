import type { Metadata } from 'next';
import { AgentSections } from '@/components/agents/AgentSections';
import { AgentsHero } from '@/components/agents/AgentsHero';
import { DemoWidgetLazy } from '@/components/agents/DemoWidgetLazy';
import { FaqSection } from '@/components/agents/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Button } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { Section } from '@/components/ui/Section';
import { getStartedHref } from '@/config/links';
import { voiceFaq } from '@/content/agents/faq';
import { voiceDemo, voicePage } from '@/content/agents/voice';
import { serviceJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/ai-agents/voice';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function VoicePage() {
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <AgentsHero
        title={voicePage.h1}
        lead={voicePage.lead}
        secondary={{ label: 'See pricing', href: '/ai-agents/pricing' }}
      />
      <Section heading="AI and recording" tone="surface">
        <Disclaimer variant="ai-recording" />
      </Section>
      <AgentSections sections={voicePage.sections} />
      <Section heading={voiceDemo.heading} intro={voiceDemo.intro} tone="surface">
        <DemoWidgetLazy scenarioId="general-voice" />
      </Section>
      <FaqSection items={voiceFaq} />
      <CtaBand
        heading="Hear it with your business details"
        body="Tell us about your business and we will set up a test call."
        actions={
          <>
            <Button href={getStartedHref({ channel: 'voice' })}>Request your AI Front Desk</Button>
            <Button href="/ai-agents/whatsapp" variant="secondary">
              See the WhatsApp assistant
            </Button>
          </>
        }
      />
      <JsonLd
        data={serviceJsonLd({
          name: 'AI voice receptionist',
          description: voicePage.lead,
          path: PATH,
          serviceType: 'AI voice receptionist',
        })}
      />
    </>
  );
}
