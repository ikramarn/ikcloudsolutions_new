import { Card } from '@/components/ui/Card';
import type { Industry } from '@/content/agents/industries';

/** The heading is an h3: the surrounding Section provides the h2. */
export function TemplateSummary({ template }: { template: Industry['template'] }) {
  return (
    <Card>
      <h3 className="text-lg font-bold text-white">{template.name}</h3>
      <p className="mt-2 text-slate-300">{template.summary}</p>
      <h4 className="mt-4 text-sm font-bold tracking-wide text-slate-200 uppercase">
        Typical connections
      </h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
        {template.integrations.map((integration) => (
          <li key={integration}>{integration}</li>
        ))}
      </ul>
    </Card>
  );
}
