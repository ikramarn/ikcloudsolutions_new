import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';
import { Brand } from '@/components/layout/Brand';
import { CookieSettings } from '@/components/consent/CookieSettings';
import { Container } from '@/components/ui/Container';
import { footerColumns } from '@/config/navigation';
import { siteConfig } from '@/config/site';

const companyDetails: readonly { label: string; value: string | undefined }[] = [
  { label: 'Company number', value: siteConfig.companyNumber },
  { label: 'Registered office', value: siteConfig.registeredOffice },
  { label: 'VAT number', value: siteConfig.vatNumber },
  { label: 'ICO registration', value: siteConfig.icoRegistrationNumber },
];

export function SiteFooter() {
  const { address } = siteConfig;
  const displayName = siteConfig.legalName ?? siteConfig.name;
  const details = companyDetails.filter((detail) => detail.value);

  return (
    <footer className="border-t border-cyan-500/20 bg-slate-950 text-sm text-slate-300">
      <Container className="pt-16 pb-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <Brand />
            <p className="max-w-sm">{siteConfig.tagline}.</p>
            <address className="space-y-2 text-sm not-italic">
              <p className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-cyan-300" />
                <span>
                  {address.street}, {address.locality}, {address.postalCode}, {address.countryName}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail aria-hidden="true" className="size-4 shrink-0 text-cyan-300" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-white hover:underline">
                  {siteConfig.email}
                </a>
              </p>
            </address>
            {details.length > 0 ? (
              <dl className="space-y-1 text-xs">
                {details.map((detail) => (
                  <div key={detail.label} className="flex gap-2">
                    <dt>{detail.label}:</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          {footerColumns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="mb-3 font-mono text-xs font-bold tracking-wider text-white uppercase">
                {column.heading}
              </h2>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-8 items-center hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {displayName}. All rights reserved.
          </p>
          <CookieSettings className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-white" />
        </div>
      </Container>
    </footer>
  );
}
