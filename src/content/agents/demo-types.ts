import type { IndustrySlug } from '@/content/agents/industries';

export interface DemoTurn {
  readonly speaker: 'ai' | 'caller' | 'system';
  readonly text: string;
  /** Pause before this turn appears, in milliseconds. A default is used when omitted. */
  readonly delayMs?: number;
}

interface DemoQuickReply {
  readonly label: string;
  readonly nextScenarioId: string;
}

export interface DemoScenario {
  readonly id: string;
  readonly channel: 'voice' | 'whatsapp';
  readonly industry: IndustrySlug | 'general';
  readonly title: string;
  readonly fictionalBusiness: string;
  readonly turns: readonly DemoTurn[];
  /** "What the owner receives": an example summary, one "Label: value" per line. */
  readonly summary: string;
  /** WhatsApp only. Branches to other scripted scenarios (maximum depth 2). */
  readonly quickReplies?: readonly DemoQuickReply[];
}

export type DemoEvent =
  | { readonly type: 'turn'; readonly turn: DemoTurn }
  | { readonly type: 'ended'; readonly summary: string }
  | { readonly type: 'error'; readonly message: string };

/** A future live transport can implement this and stream events from a real service. */
export interface DemoTransport {
  start(
    scenarioId: string,
    signal: AbortSignal,
    options?: { readonly fromTurn?: number },
  ): AsyncIterable<DemoEvent>;
}
