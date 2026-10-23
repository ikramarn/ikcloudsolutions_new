import type { DemoScenario, DemoTurn } from '@/content/agents/demo-types';
import { cn } from '@/lib/cn';

const SPEAKER_LABEL: Record<DemoTurn['speaker'], string> = {
  ai: 'AI assistant',
  caller: 'Caller',
  system: 'Note',
};

const WHATSAPP_LABEL: Record<DemoTurn['speaker'], string> = {
  ai: 'AI assistant',
  caller: 'Customer',
  system: 'Note',
};

interface TranscriptProps {
  turns: readonly DemoTurn[];
  channel: DemoScenario['channel'];
  className?: string;
}

/**
 * A static, server-renderable list of turns. Voice shows labelled lines; WhatsApp shows chat
 * bubbles. The speaker is always spelled out in text, never colour alone.
 */
export function Transcript({ turns, channel, className }: TranscriptProps) {
  const labels = channel === 'voice' ? SPEAKER_LABEL : WHATSAPP_LABEL;
  return (
    <ol className={cn('space-y-3', className)}>
      {turns.map((turn, index) => {
        if (turn.speaker === 'system') {
          return (
            <li key={index} className="text-center text-sm text-slate-300 italic">
              {turn.text}
            </li>
          );
        }
        const isAi = turn.speaker === 'ai';
        return (
          <li
            key={index}
            className={cn(
              'max-w-[85%] rounded-2xl px-4 py-3 text-base',
              channel === 'whatsapp'
                ? isAi
                  ? 'mr-auto bg-emerald-900/50 text-slate-100'
                  : 'ml-auto bg-white/10 text-slate-100'
                : isAi
                  ? 'mr-auto border border-cyan-brand/30 bg-cyan-brand/10 text-slate-100'
                  : 'ml-auto border border-white/15 bg-white/5 text-slate-100',
            )}
          >
            <span className="block text-xs font-bold tracking-wide text-slate-300 uppercase">
              {labels[turn.speaker]}
            </span>
            {turn.text}
          </li>
        );
      })}
    </ol>
  );
}
