import type { Metadata } from 'next';
import { ChannelCard } from '@/components/agents/ChannelCard';
import { AgentsHero } from '@/components/agents/AgentsHero';
import { DemoWidgetLazy } from '@/components/agents/DemoWidgetLazy';
import { FaqSection } from '@/components/agents/FaqSection';
import { IndustryCard } from '@/components/agents/IndustryCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CtaBand } from '@/components/ui/CtaBand';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { FeatureGrid } from '@/components/ui/FeatureGrid';
import { Section } from '@/components/ui/Section';
import { StepList } from '@/components/ui/StepList';
import { getStartedHref } from '@/config/links';
import { pricingConfig } from '@/config/pricing';
import { hubFaq } from '@/content/agents/faq';
import { industries } from '@/content/agents/industries';
import { overviewContent } from '@/content/agents/overview';
import { buildCopyContext } from '@/lib/copy/faq';
import { serviceJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/ai-agents';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function AiAgentsPage() {
  const ctx = buildCopyContext();
  const content = overviewContent;
  const availableAddons = pricingConfig.addons.filter(
    (addon) => addon.availability === 'available',
  );
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <AgentsHero
        title={content.h1}
        lead={content.lead}
        preLaunchBadge={content.badge}
        secondary={{ label: content.secondaryCta, href: '/ai-agents/pricing' }}
      />
      <Section heading={content.value.heading} tone="surface">
        <FeatureGrid features={content.value.features} />
      </Section>
      <Section heading={content.steps.heading}>
        <StepList steps={content.steps.items} />
      </Section>
      <Section heading={content.channels.heading} tone="surface">
        <div className="grid gap-6 md:grid-cols-2">
          <ChannelCard channel="voice" {...content.channels.voice} />
          <ChannelCard channel="whatsapp" {...content.channels.whatsapp} />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
          <DemoWidgetLazy scenarioId="general-voice" />
          <Disclaimer variant="ai-recording" />
        </div>
      </Section>
      <Section heading={content.whatYouGet.heading}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {content.whatYouGet.items.map((item) => (
            <li key={item} className="glass-card rounded-xl p-4 text-slate-200">
              {item}
            </li>
          ))}
        </ul>
      </Section>
      <Section heading={content.industries.heading} intro={content.industries.intro} tone="surface">
        <ul className="grid gap-6 md:grid-cols-3">
          {industries.map((industry) => (
            <li key={industry.slug}>
              <IndustryCard industry={industry} />
            </li>
          ))}
        </ul>
      </Section>
      <Section heading={content.addons.heading} intro={content.addons.intro}>
        <ul aria-label="Available add-ons" className="flex flex-wrap gap-2">
          {availableAddons.map((addon) => (
            <li key={addon.id}>
              <Badge tone="neutral">{addon.name}</Badge>
            </li>
          ))}
        </ul>
      </Section>
      <Section heading={content.pricing.heading} intro={content.pricing.intro} tone="surface">
        <ul className="grid gap-6 md:grid-cols-3">
          {pricingConfig.plans.map((plan) => (
            <li key={plan.id}>
              <Card className="h-full">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-slate-300">{plan.summary}</p>
                <p className="mt-3 font-semibold text-white">
                  From {ctx.displayPrice(plan.id, 'monthly')}
                </p>
              </Card>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button href="/ai-agents/pricing" variant="secondary">
            See plans, setup fees and add-ons
          </Button>
        </div>
      </Section>
      <Section heading={content.limits.heading}>
        <ul className="list-disc space-y-2 pl-5 text-slate-200">
          {content.limits.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
      <FaqSection items={hubFaq} tone="surface" />
      <CtaBand
        heading={content.cta.heading}
        body={content.cta.body}
        actions={
          <>
            <Button href={getStartedHref()}>Request your AI Front Desk</Button>
            <Button href="/ai-agents/how-it-works" variant="secondary">
              How it works
            </Button>
          </>
        }
      />
      <JsonLd
        data={serviceJsonLd({
          name: 'AI Front Desk',
          description:
            'A managed AI receptionist for phone and WhatsApp, set up, run and improved by IK Cloud Solutions.',
          path: PATH,
          serviceType: 'AI receptionist',
        })}
      />
    </>
  );
}
