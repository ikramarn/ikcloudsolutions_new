'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  /** Auto-dismiss delay in milliseconds. */
  durationMs?: number;
}

/** A polite live region. Not used for form success: forms show an inline panel instead. */
export function Toast({ message, onDismiss, durationMs = 6000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      className="glass-panel-glow fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl p-4 text-sm text-slate-100"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-white/10"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
