import { ArrowDown, Boxes, GitBranch, RefreshCw, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { architectureCard } from '@/content/home';

const icons: Record<(typeof architectureCard.nodes)[number]['id'], LucideIcon> = {
  git: GitBranch,
  argocd: RefreshCw,
  cluster: Boxes,
};

/** A static diagram. It carries no counts, percentages or live indicators. */
export function ArchitectureCard() {
  return (
    <Card variant="glow">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">{architectureCard.heading}</h2>
        <Badge tone="neutral">{architectureCard.label}</Badge>
      </div>
      <ol className="mt-5 space-y-2">
        {architectureCard.nodes.map((node, index) => {
          const Icon = icons[node.id];
          return (
            <li key={node.id}>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-surface p-4">
                <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cyan-300" />
                <div>
                  <p className="font-semibold text-white">{node.title}</p>
                  <p className="text-sm text-slate-300">{node.detail}</p>
                </div>
              </div>
              {index < architectureCard.nodes.length - 1 ? (
                <ArrowDown aria-hidden="true" className="mx-auto my-1 size-5 text-slate-400" />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm text-slate-300">{architectureCard.caption}</p>
    </Card>
  );
}
