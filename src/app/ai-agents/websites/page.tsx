import type { Metadata } from 'next';
import { AddonsTable } from '@/components/agents/AddonsTable';
import { AgentSections } from '@/components/agents/AgentSections';
import { AgentsHero } from '@/components/agents/AgentsHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Button } from '@/components/ui/Button';
import { CtaBand } from '@/components/ui/CtaBand';
import { Section } from '@/components/ui/Section';
import { getStartedHref } from '@/config/links';
import { websitesPage } from '@/content/agents/websites';
import { serviceJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/ai-agents/websites';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function WebsitesPage() {
  // The CTA adds the website add-on to the intake pre-selection; the intake validates the id.
  const href = getStartedHref({ addons: ['website-express'] });
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <AgentsHero
        title={websitesPage.h1}
        lead={websitesPage.lead}
        primaryLabel="Request your AI Front Desk with a website"
        secondary={{ label: 'See pricing', href: '/ai-agents/pricing' }}
      />
      <AgentSections sections={websitesPage.sections} />
      <Section
        heading="Website and domain pricing"
        intro="Prices come from the same list as every other add-on."
        tone="surface"
      >
        <AddonsTable only={['website-express', 'domain']} />
      </Section>
      <CtaBand
        heading="Add a website to your request"
        body="The request form pre-selects the website add-on. You can untick it at any time."
        actions={
          <>
            <Button href={href}>Request with a website</Button>
            <Button href="/ai-agents/pricing" variant="secondary">
              See all pricing
            </Button>
          </>
        }
      />
      <JsonLd
        data={serviceJsonLd({
          name: 'Website add-on for the AI Front Desk',
          description: websitesPage.lead,
          path: PATH,
          serviceType: 'Website design and hosting',
        })}
      />
    </>
  );
}
