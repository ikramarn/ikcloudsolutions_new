'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConsultationButton } from '@/components/forms/ConsultationButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Brand } from '@/components/layout/Brand';
import { MegaMenu } from '@/components/layout/MegaMenu';
import { MobileNav } from '@/components/layout/MobileNav';
import { getStartedHref } from '@/config/links';
import { HEADER_CTA_LABEL, headerItems } from '@/config/navigation';

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-deep/95">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Brand />
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {headerItems.map((item) =>
              item.groups ? (
                <MegaMenu key={item.label} item={item} />
              ) : item.href ? (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-200 hover:text-white aria-[current=page]:text-cyan-300"
                  >
                    {item.label}
                    {item.badge ? <Badge tone="demo">{item.badge}</Badge> : null}
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ConsultationButton variant="ghost" size="sm" className="hidden lg:inline-flex">
            Book a consultation
          </ConsultationButton>
          <Button href={getStartedHref()} size="sm" className="hidden lg:inline-flex">
            {HEADER_CTA_LABEL}
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
