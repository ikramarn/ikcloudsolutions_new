import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { asRoute } from '@/config/links';
import type { Industry } from '@/content/agents/industries';

/** The heading is an h3: the surrounding Section provides the h2. */
export function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Card className="flex h-full flex-col">
      <h3 className="text-lg font-bold text-white">{industry.name}</h3>
      <p className="mt-1 text-sm text-slate-300">{industry.cardTitle}</p>
      <p className="mt-3 flex-1 text-slate-300">{industry.intro}</p>
      <Link
        href={asRoute(`/ai-agents/for/${industry.slug}`)}
        className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-cyan-300 hover:underline"
      >
        See the {industry.name.toLowerCase()} example
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </Card>
  );
}
