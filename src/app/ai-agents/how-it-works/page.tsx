import type { Metadata } from 'next';
import { AgentSections } from '@/components/agents/AgentSections';
import { AgentsHero } from '@/components/agents/AgentsHero';
import { FaqSection } from '@/components/agents/FaqSection';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Button } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { Section } from '@/components/ui/Section';
import { getStartedHref } from '@/config/links';
import { howItWorksFaq } from '@/content/agents/faq';
import { howItWorksPage } from '@/content/agents/howItWorks';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/ai-agents/how-it-works';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function HowItWorksPage() {
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <AgentsHero
        title={howItWorksPage.h1}
        lead={howItWorksPage.lead}
        secondary={{ label: 'See pricing', href: '/ai-agents/pricing' }}
      />
      <Section heading="AI and recording" tone="surface">
        <Disclaimer variant="ai-recording" />
      </Section>
      <AgentSections sections={howItWorksPage.sections} />
      <FaqSection items={howItWorksFaq} tone="surface" />
      <CtaBand
        heading="Ready to start?"
        body="Tell us about your business and we will come back with a plan and a launch timeline."
        actions={
          <>
            <Button href={getStartedHref()}>Request your AI Front Desk</Button>
            <Button href="/ai-agents/done-for-you" variant="secondary">
              Done-for-you set-up
            </Button>
          </>
        }
      />
    </>
  );
}
