import { OwnerSummary } from '@/components/agents/OwnerSummary';
import { Transcript } from '@/components/agents/Transcript';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import type { DemoScenario } from '@/content/agents/demo-types';
import { getScenario } from '@/content/agents/demos';

function requireScenario(id: string): DemoScenario {
  const scenario = getScenario(id);
  if (!scenario) throw new Error(`Unknown demo scenario "${id}".`);
  return scenario;
}

function ExamplePanel({ scenario }: { scenario: DemoScenario }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="simulated">Simulated</Badge>
        <p className="text-sm text-slate-300">
          {scenario.title}. A scripted example for a fictional business,{' '}
          {scenario.fictionalBusiness}.
        </p>
      </div>
      <Transcript turns={scenario.turns} channel={scenario.channel} />
      <OwnerSummary summary={scenario.summary} />
    </div>
  );
}

interface ConversationExampleProps {
  voiceId: string;
  whatsappId: string;
}

/**
 * Both the voice and the WhatsApp example are in the server HTML (Tabs with forceMount hides the
 * inactive one with CSS), so crawlers and no-JavaScript readers get both.
 */
export function ConversationExample({ voiceId, whatsappId }: ConversationExampleProps) {
  return (
    <Tabs
      label="Example conversation channel"
      forceMountPanels
      tabs={[
        {
          value: 'voice',
          label: 'Voice call',
          content: <ExamplePanel scenario={requireScenario(voiceId)} />,
        },
        {
          value: 'whatsapp',
          label: 'WhatsApp',
          content: <ExamplePanel scenario={requireScenario(whatsappId)} />,
        },
      ]}
    />
  );
}
