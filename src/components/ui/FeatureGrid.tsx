import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

export interface Feature {
  title: string;
  description: ReactNode;
  icon?: LucideIcon;
}

interface FeatureGridProps {
  features: readonly Feature[];
  columns?: 2 | 3 | 4;
}

const columnClasses = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

/** Headings are h3: the surrounding Section provides the h2. */
export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  return (
    <ul className={cn('grid gap-6', columnClasses[columns])}>
      {features.map(({ title, description, icon: Icon }) => (
        <li key={title}>
          <Card className="h-full">
            {Icon ? <Icon aria-hidden="true" className="mb-3 size-6 text-cyan-300" /> : null}
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <div className="mt-2 text-slate-300">{description}</div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
