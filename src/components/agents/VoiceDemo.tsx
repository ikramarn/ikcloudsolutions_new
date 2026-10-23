import { Phone } from 'lucide-react';
import { cn } from '@/lib/cn';

interface VoiceDemoProps {
  business: string;
  /** Animated bars show only while a call plays and motion is allowed. */
  active: boolean;
}

// A placeholder, not a real number.
const PLACEHOLDER_NUMBER = '01XXX XXXXXX';

/** The call card for the voice demo. It has no audio element and makes no sound. */
export function VoiceDemo({ business, active }: VoiceDemoProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/15 bg-surface p-4">
      <span
        aria-hidden="true"
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"
      >
        <Phone className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{business}</p>
        <p className="font-mono text-sm text-slate-300">{PLACEHOLDER_NUMBER}</p>
      </div>
      <div aria-hidden="true" className="flex h-8 items-end gap-1">
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cn(
              'w-1.5 rounded bg-cyan-brand',
              active ? 'h-6 motion-safe:animate-pulse' : 'h-2',
            )}
            style={active ? { animationDelay: `${bar * 150}ms` } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
