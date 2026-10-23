import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { asRoute } from '@/config/links';
import { services, type ServiceAccent } from '@/content/services';

export const accentText: Record<ServiceAccent, string> = {
  cyan: 'text-cyan-300',
  violet: 'text-violet-300',
  blue: 'text-blue-300',
  emerald: 'text-emerald-300',
  rose: 'text-rose-300',
  amber: 'text-amber-300',
};

/** Six services with no metric lines. Headings are h3: the surrounding Section provides the h2. */
export function ServicesGrid() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <li key={service.id}>
            <Card className="flex h-full flex-col">
              <Icon aria-hidden="true" className={`mb-3 size-7 ${accentText[service.accent]}`} />
              <h3 className="text-lg font-bold text-white">{service.title}</h3>
              <p className="mt-2 flex-1 text-slate-300">{service.tagline}</p>
              <Link
                href={asRoute(`/services#${service.id}`)}
                className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-cyan-300 hover:underline"
              >
                Learn more
                <span className="sr-only"> about {service.title}</span>
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
