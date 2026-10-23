'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: readonly TabItem[];
  defaultValue?: string;
  /** Accessible name for the tab list. */
  label: string;
  /**
   * Keep every panel in the server HTML (inactive ones hidden with data-[state=inactive]:hidden)
   * so indexed content is not lost.
   */
  forceMountPanels?: boolean;
  className?: string;
}

export function Tabs({
  tabs,
  defaultValue,
  label,
  forceMountPanels = false,
  className,
}: TabsProps) {
  const first = tabs[0]?.value;
  return (
    <RadixTabs.Root defaultValue={defaultValue ?? first} className={className}>
      <RadixTabs.List aria-label={label} className="mb-4 flex gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className="min-h-11 rounded-t-lg px-4 text-sm font-semibold text-slate-300 hover:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-brand data-[state=active]:text-white"
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((tab) => (
        <RadixTabs.Content
          key={tab.value}
          value={tab.value}
          forceMount={forceMountPanels ? true : undefined}
          className={cn(forceMountPanels && 'data-[state=inactive]:hidden')}
        >
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
