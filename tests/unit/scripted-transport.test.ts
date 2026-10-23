import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScriptedDemoTransport } from '@/components/agents/ScriptedDemoTransport';
import type { DemoEvent } from '@/content/agents/demo-types';
import { getScenario } from '@/content/agents/demos';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

async function collect(iterable: AsyncIterable<DemoEvent>): Promise<DemoEvent[]> {
  const events: DemoEvent[] = [];
  for await (const event of iterable) events.push(event);
  return events;
}

describe('ScriptedDemoTransport', () => {
  const transport = new ScriptedDemoTransport();

  it('plays every turn in order, then ends with the owner summary', async () => {
    const scenario = getScenario('general-whatsapp');
    const done = collect(transport.start('general-whatsapp', new AbortController().signal));
    await vi.runAllTimersAsync();
    const events = await done;
    expect(events.filter((event) => event.type === 'turn')).toHaveLength(
      scenario?.turns.length ?? 0,
    );
    expect(events.at(-1)).toEqual({ type: 'ended', summary: scenario?.summary });
  });

  it('can resume from a turn', async () => {
    const scenario = getScenario('general-voice');
    const done = collect(
      transport.start('general-voice', new AbortController().signal, { fromTurn: 8 }),
    );
    await vi.runAllTimersAsync();
    const events = await done;
    expect(events.filter((event) => event.type === 'turn')).toHaveLength(
      (scenario?.turns.length ?? 0) - 8,
    );
  });

  it('stops and emits nothing more once aborted', async () => {
    const controller = new AbortController();
    const seen: DemoEvent[] = [];
    const run = (async () => {
      for await (const event of transport.start('general-voice', controller.signal)) {
        seen.push(event);
        if (seen.length === 1) controller.abort();
      }
    })();
    await vi.advanceTimersByTimeAsync(10_000);
    await run;
    expect(seen).toHaveLength(1);
    expect(seen[0]?.type).toBe('turn');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reports an unknown scenario as an error event', async () => {
    const events = await collect(transport.start('nope', new AbortController().signal));
    expect(events).toEqual([{ type: 'error', message: 'That demo is not available.' }]);
  });
});
