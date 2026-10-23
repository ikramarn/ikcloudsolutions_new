import type { ReactNode } from 'react';
import { AgentsSubNav } from '@/components/agents/AgentsSubNav';

export default function AiAgentsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AgentsSubNav />
      {children}
    </>
  );
}
