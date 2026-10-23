'use client';

import dynamic from 'next/dynamic';

function DemoPlaceholder() {
  return (
    <div className="glass-panel rounded-2xl p-6 text-slate-300" aria-busy="true">
      Loading the simulated demo...
    </div>
  );
}

// ssr: false is not allowed in Server Components, so this thin client wrapper holds it. The
// example conversations on each page are rendered separately in the server HTML.
export const DemoWidgetLazy = dynamic(
  () => import('@/components/agents/DemoWidget').then((module) => module.DemoWidget),
  { ssr: false, loading: DemoPlaceholder },
);
