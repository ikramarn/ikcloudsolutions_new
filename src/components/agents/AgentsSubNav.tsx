'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { aiFrontDeskLinks } from '@/config/navigation';

/** Slim sub-navigation shared by every AI Front Desk page. */
export function AgentsSubNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="AI Front Desk" className="border-b border-white/10 bg-surface">
      <Container>
        <ul className="flex gap-1 overflow-x-auto py-1">
          {aiFrontDeskLinks.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-200 hover:text-white aria-[current=page]:text-cyan-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
