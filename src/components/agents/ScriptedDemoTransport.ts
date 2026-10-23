import type { DemoEvent, DemoTransport, DemoTurn } from '@/content/agents/demo-types';
import { getScenario } from '@/content/agents/demos';

const SYSTEM_DELAY_MS = 500;
const BASE_DELAY_MS = 700;
const PER_CHARACTER_MS = 18;
const MAX_DELAY_MS = 2600;

function defaultDelay(turn: DemoTurn): number {
  if (turn.speaker === 'system') return SYSTEM_DELAY_MS;
  return Math.min(MAX_DELAY_MS, BASE_DELAY_MS + turn.text.length * PER_CHARACTER_MS);
}

/** Resolves true after `ms`, or false as soon as the signal aborts (the timer is cleared). */
function wait(ms: number, signal: AbortSignal): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise((resolve) => {
    const onAbort = () => {
      clearTimeout(timer);
      resolve(false);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve(true);
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Plays a script from src/content/agents/demos.ts. Nothing is sent anywhere and no audio is
 * produced. A future live transport can implement DemoTransport instead.
 */
export class ScriptedDemoTransport implements DemoTransport {
  async *start(
    scenarioId: string,
    signal: AbortSignal,
    options?: { readonly fromTurn?: number },
  ): AsyncGenerator<DemoEvent, void, undefined> {
    const scenario = getScenario(scenarioId);
    if (!scenario) {
      yield { type: 'error', message: 'That demo is not available.' };
      return;
    }
    for (const turn of scenario.turns.slice(options?.fromTurn ?? 0)) {
      const keepGoing = await wait(turn.delayMs ?? defaultDelay(turn), signal);
      if (!keepGoing) return;
      yield { type: 'turn', turn };
    }
    yield { type: 'ended', summary: scenario.summary };
  }
}
