import type { ReactNode } from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppDemoProps {
  business: string;
  children: ReactNode;
}

/** A phone-style frame around the message thread. */
export function WhatsAppDemo({ business, children }: WhatsAppDemoProps) {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-surface">
      <div className="flex items-center gap-3 border-b border-white/10 bg-emerald-900/40 px-4 py-3">
        <MessageCircle aria-hidden="true" className="size-5 text-emerald-300" />
        <p className="font-semibold text-white">{business}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
