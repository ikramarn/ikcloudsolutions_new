import type { Metadata } from 'next';
import Image from 'next/image';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CtaBand } from '@/components/ui/CtaBand';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { siteConfig } from '@/config/site';
import { aboutContent } from '@/content/about';
import { personJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/about';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function AboutPage() {
  const { address } = siteConfig;
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <PageHero title={aboutContent.title} lead={aboutContent.lead} />
      <Section heading="Mission and vision" tone="surface">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="text-xl font-bold text-white">{aboutContent.mission.heading}</h3>
            <p className="mt-2 text-slate-300">{aboutContent.mission.body}</p>
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-white">{aboutContent.vision.heading}</h3>
            <p className="mt-2 text-slate-300">{aboutContent.vision.body}</p>
          </Card>
        </div>
      </Section>
      <Section heading={aboutContent.founder.heading} eyebrow={aboutContent.founder.role}>
        <div className="grid items-start gap-8 md:grid-cols-[auto_1fr]">
          <Image
            src={siteConfig.founder.image}
            alt={aboutContent.founder.imageAlt}
            width={320}
            height={400}
            className="h-auto w-full max-w-xs rounded-2xl object-cover"
          />
          <div>
            <p className="max-w-2xl text-lg text-slate-200">{aboutContent.founder.bio}</p>
            <ul aria-label="Specialties" className="mt-5 flex flex-wrap gap-2">
              {aboutContent.founder.specialties.map((specialty) => (
                <li key={specialty}>
                  <Badge tone="neutral">{specialty}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <Section heading={aboutContent.addressHeading} tone="surface">
        <address className="text-lg text-slate-200 not-italic">
          {siteConfig.name}
          <br />
          {address.street}
          <br />
          {address.locality}, {address.postalCode}
          <br />
          {address.countryName}
        </address>
        <div className="mt-6">
          <Button href="/contact" variant="secondary">
            {aboutContent.contactCta}
          </Button>
        </div>
      </Section>
      <CtaBand
        heading="Explore the AI Front Desk"
        body="A managed AI receptionist for phone and WhatsApp, for UK businesses."
        actions={<Button href="/ai-agents">See how it works</Button>}
      />
      <JsonLd data={personJsonLd()} />
    </>
  );
}
