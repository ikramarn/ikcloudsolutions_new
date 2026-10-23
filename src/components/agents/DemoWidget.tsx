'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { OwnerSummary } from '@/components/agents/OwnerSummary';
import { ScriptedDemoTransport } from '@/components/agents/ScriptedDemoTransport';
import { Transcript } from '@/components/agents/Transcript';
import { VoiceDemo } from '@/components/agents/VoiceDemo';
import { WhatsAppDemo } from '@/components/agents/WhatsAppDemo';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { DemoTransport, DemoTurn } from '@/content/agents/demo-types';
import { getScenario } from '@/content/agents/demos';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined;
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const reducedMotionSnapshot = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION).matches;

type Status = 'idle' | 'playing' | 'paused' | 'ended';

const defaultTransport: DemoTransport = new ScriptedDemoTransport();

interface DemoWidgetProps {
  scenarioId: string;
  transport?: DemoTransport;
}

/**
 * A scripted, silent simulation. It is always labelled SIMULATED, plays no audio, honours
 * prefers-reduced-motion by showing the whole transcript, and never writes state after the
 * component unmounts (every update is guarded by the AbortController it started with).
 */
export function DemoWidget({
  scenarioId: initialScenarioId,
  transport = defaultTransport,
}: DemoWidgetProps) {
  const [scenarioId, setScenarioId] = useState(initialScenarioId);
  const [status, setStatus] = useState<Status>('idle');
  const [turns, setTurns] = useState<readonly DemoTurn[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    () => false,
  );

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  const scenario = getScenario(scenarioId);
  const instant = reducedMotion || showAll;

  async function run(id: string, fromTurn: number) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setError(null);
    setStatus('playing');
    try {
      for await (const event of transport.start(id, controller.signal, { fromTurn })) {
        if (controller.signal.aborted) return;
        if (event.type === 'turn') {
          setTurns((previous) => [...previous, event.turn]);
        } else if (event.type === 'ended') {
          setSummary(event.summary);
          setStatus('ended');
        } else {
          setError(event.message);
          setStatus('paused');
        }
      }
    } catch {
      if (controller.signal.aborted) return;
      setError('The demo stopped unexpectedly. Press Restart to try again.');
      setStatus('paused');
    }
  }

  function reset(id: string) {
    controllerRef.current?.abort();
    setScenarioId(id);
    setTurns([]);
    setSummary(null);
    setShowAll(false);
    setError(null);
  }

  function play() {
    void run(scenarioId, turns.length);
  }

  function pause() {
    controllerRef.current?.abort();
    setStatus('paused');
  }

  function restart() {
    reset(scenarioId);
    void run(scenarioId, 0);
  }

  function showFullTranscript() {
    controllerRef.current?.abort();
    setShowAll(true);
    setStatus('ended');
  }

  function branch(nextId: string) {
    reset(nextId);
    void run(nextId, 0);
  }

  if (!scenario) {
    return <p role="alert">That demo is not available.</p>;
  }

  const visibleTurns = instant ? scenario.turns : turns;
  const visibleSummary = instant ? scenario.summary : summary;
  const finished = instant || status === 'ended';

  const transcript = (
    <div role="log" aria-live="polite" aria-label="Simulated conversation" className="min-h-24">
      <Transcript turns={visibleTurns} channel={scenario.channel} />
    </div>
  );

  return (
    <div className="glass-panel space-y-4 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-white">{scenario.title}</h3>
        <Badge tone="simulated">Simulated</Badge>
      </div>
      <p className="text-sm text-slate-300">
        Simulated demo: scripted conversation with a fictional business,{' '}
        {scenario.fictionalBusiness}. No real call is placed and no message is sent.
        {scenario.channel === 'voice' ? ' No audio is played.' : ''}
      </p>
      {scenario.channel === 'voice' ? (
        <>
          <VoiceDemo
            business={scenario.fictionalBusiness}
            active={status === 'playing' && !reducedMotion}
          />
          {transcript}
        </>
      ) : (
        <WhatsAppDemo business={scenario.fictionalBusiness}>{transcript}</WhatsAppDemo>
      )}
      {error ? <p role="alert">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        {status === 'playing' ? (
          <Button variant="secondary" onClick={pause}>
            Pause
          </Button>
        ) : (
          <Button onClick={play} disabled={finished}>
            {status === 'paused' ? 'Resume' : 'Play'}
          </Button>
        )}
        <Button variant="secondary" onClick={restart} disabled={reducedMotion}>
          Restart
        </Button>
        {!instant ? (
          <Button variant="ghost" onClick={showFullTranscript}>
            Show full transcript
          </Button>
        ) : null}
      </div>
      {finished && visibleSummary ? <OwnerSummary summary={visibleSummary} /> : null}
      {finished && scenario.quickReplies ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-200">Choose a suggested example</p>
          <ul className="flex flex-wrap gap-2">
            {scenario.quickReplies.map((reply) => (
              <li key={reply.nextScenarioId}>
                <Button size="sm" variant="secondary" onClick={() => branch(reply.nextScenarioId)}>
                  {reply.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
