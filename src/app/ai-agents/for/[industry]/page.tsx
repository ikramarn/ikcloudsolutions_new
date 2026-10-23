import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AgentsHero } from '@/components/agents/AgentsHero';
import { ConversationExample } from '@/components/agents/ConversationExample';
import { FaqSection } from '@/components/agents/FaqSection';
import { TemplateSummary } from '@/components/agents/TemplateSummary';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CtaBand } from '@/components/ui/CtaBand';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { Section } from '@/components/ui/Section';
import { getStartedHref } from '@/config/links';
import { getIndustry, industries } from '@/content/agents/industries';
import { serviceJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

// Only the three known industries exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return industries.map((industry) => ({ industry: industry.slug }));
}

interface IndustryPageProps {
  params: Promise<{ industry: string }>;
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { industry } = await params;
  return buildRouteMetadata(`/ai-agents/for/${industry}`);
}

function ListCard({ heading, items }: { heading: string; items: readonly string[] }) {
  return (
    <Card className="h-full">
      <h3 className="text-lg font-bold text-white">{heading}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { industry: slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();
  const path = `/ai-agents/for/${industry.slug}`;
  return (
    <>
      <PageBreadcrumbs path={path} />
      <AgentsHero
        title={industry.h1}
        lead={industry.intro}
        secondary={{ label: 'See pricing', href: '/ai-agents/pricing' }}
      />
      <Section heading="Where it helps" tone="surface">
        <ul className="list-disc space-y-2 pl-5 text-slate-200">
          {industry.pains.map((pain) => (
            <li key={pain}>{pain}</li>
          ))}
        </ul>
      </Section>
      <Section heading="What the agent does and does not do">
        <div className="grid gap-6 md:grid-cols-2">
          <ListCard heading="What the agent handles" items={industry.handles} />
          <ListCard heading="What it never does" items={industry.neverDoes} />
          <ListCard heading="When it hands over to a person" items={industry.escalates} />
          <ListCard heading="What it captures" items={industry.captures} />
        </div>
      </Section>
      <Section heading="Starting template" tone="surface">
        <TemplateSummary template={industry.template} />
      </Section>
      <Section
        heading="Example conversation for a fictional business"
        intro="Both examples are scripted simulations. No real call or message took place."
      >
        <div className="mb-6">
          <Disclaimer variant="ai-recording" />
        </div>
        <ConversationExample
          voiceId={industry.demoScriptIds.voice}
          whatsappId={industry.demoScriptIds.whatsapp}
        />
      </Section>
      <FaqSection items={industry.faq} tone="surface" />
      <CtaBand
        heading={`Request an AI Front Desk for ${industry.cardTitle.toLowerCase()}`}
        body="The form is pre-filled with your industry. We come back with a plan and a quote."
        actions={
          <>
            <Button href={getStartedHref({ industry: industry.slug })}>
              Request your AI Front Desk
            </Button>
            <Button href="/ai-agents/voice" variant="secondary">
              Voice
            </Button>
            <Button href="/ai-agents/whatsapp" variant="secondary">
              WhatsApp
            </Button>
          </>
        }
      />
      <JsonLd
        data={serviceJsonLd({
          name: `AI receptionist for ${industry.name.toLowerCase()}`,
          description: industry.intro,
          path,
          serviceType: 'AI receptionist',
        })}
      />
    </>
  );
}
