import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { ClickToLoadMap } from '@/components/home/ClickToLoadMap';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Card } from '@/components/ui/Card';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { siteConfig } from '@/config/site';
import { contactContent } from '@/content/contact';
import { contactPageJsonLd, professionalServiceJsonLd } from '@/lib/seo/jsonld';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/contact';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function ContactPage() {
  const { address } = siteConfig;
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <PageHero title={contactContent.title} lead={contactContent.lead} />
      <Section heading={contactContent.detailsHeading} tone="surface">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Card>
              <ul className="space-y-4 text-slate-200">
                <li className="flex items-start gap-3">
                  <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
                  <address className="not-italic">
                    {address.street}, {address.locality}, {address.postalCode}
                    <br />
                    {address.countryName}
                  </address>
                </li>
                <li className="flex items-start gap-3">
                  <Mail aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
                  <a className="underline underline-offset-2" href={`mailto:${siteConfig.email}`}>
                    {siteConfig.email}
                  </a>
                </li>
                {siteConfig.phone ? (
                  <li className="flex items-start gap-3">
                    <Phone aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
                    <a
                      className="underline underline-offset-2"
                      href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                    >
                      {siteConfig.phone}
                    </a>
                  </li>
                ) : null}
              </ul>
            </Card>
            <div>
              <h2 className="mb-3 text-xl font-bold text-white">{contactContent.mapHeading}</h2>
              <ClickToLoadMap />
            </div>
          </div>
          <Card variant="glow" className="lg:col-span-7">
            <h2 className="mb-5 text-2xl font-extrabold text-white">
              {contactContent.formHeading}
            </h2>
            <ContactForm />
          </Card>
        </div>
      </Section>
      <JsonLd data={professionalServiceJsonLd()} />
      <JsonLd data={contactPageJsonLd(PATH)} />
    </>
  );
}
