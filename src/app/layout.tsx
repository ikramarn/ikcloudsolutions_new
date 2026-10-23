import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { CookieBanner } from '@/components/consent/CookieBanner';
import { ConsultationProvider } from '@/components/forms/ConsultationProvider';
import { PurgeLegacyStorage } from '@/components/consent/PurgeLegacyStorage';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { SkipLink } from '@/components/ui/SkipLink';
import { findRoute, resolveDescription } from '@/config/routes';
import { siteConfig } from '@/config/site';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { TITLE_TEMPLATE } from '@/lib/seo/metadata';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const home = findRoute('/');

// Pages build their own canonical, Open Graph and Twitter metadata with buildMetadata, so only
// the shared defaults live here.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: home?.title ?? siteConfig.name, template: TITLE_TEMPLATE },
  description: home ? resolveDescription(home) : siteConfig.tagline,
  applicationName: siteConfig.name,
};

export const viewport: Viewport = {
  themeColor: '#07090e',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${plusJakarta.variable} ${jetBrainsMono.variable}`}>
      <body>
        <ConsentProvider>
          <ConsultationProvider>
            <SkipLink />
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
            <CookieBanner />
            <PurgeLegacyStorage />
          </ConsultationProvider>
        </ConsentProvider>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
