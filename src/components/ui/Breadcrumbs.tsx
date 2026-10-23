import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { asRoute } from '@/config/links';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current page. */
  href?: string;
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-300">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={asRoute(item.href)} className="hover:text-white hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="text-white">
                  {item.label}
                </span>
              )}
              {isLast ? null : (
                <ChevronRight aria-hidden="true" className="size-4 text-slate-400" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
