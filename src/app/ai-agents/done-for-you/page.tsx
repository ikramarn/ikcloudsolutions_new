import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { AgentsHero } from '@/components/agents/AgentsHero';
import { SetupPackages } from '@/components/agents/SetupPackages';
import { Timeline } from '@/components/agents/Timeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Button } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { Section } from '@/components/ui/Section';
import { doneForYouHref } from '@/config/links';
import { doneForYouPage } from '@/content/agents/doneForYou';
import { serviceJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/ai-agents/done-for-you';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function DoneForYouPage() {
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <AgentsHero
        title={doneForYouPage.h1}
        lead={doneForYouPage.lead}
        secondary={{ label: 'See pricing', href: '/ai-agents/pricing' }}
      />
      <Section
        heading={doneForYouPage.packagesHeading}
        intro={doneForYouPage.packagesIntro}
        tone="surface"
      >
        <SetupPackages />
        <p className="mt-6 text-slate-300">{doneForYouPage.selfServeNote}</p>
      </Section>
      <Section heading={doneForYouPage.timelineHeading}>
        <Timeline steps={doneForYouPage.timeline} />
      </Section>
      <Section heading={doneForYouPage.checklistHeading} tone="surface">
        <ul className="space-y-3">
          {doneForYouPage.checklist.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-200">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand
        heading="Start your request"
        body="Tell us about your business and we will come back with a plan, a quote and a launch timeline."
        actions={<Button href={doneForYouHref}>Request your AI Front Desk</Button>}
      />
      <JsonLd
        data={serviceJsonLd({
          name: 'Done-for-you AI Front Desk setup',
          description: doneForYouPage.lead,
          path: PATH,
          serviceType: 'AI receptionist set-up',
        })}
      />
    </>
  );
}
