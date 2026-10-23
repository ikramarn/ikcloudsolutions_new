'use client';

import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

interface AccordionProps {
  items: readonly AccordionItem[];
  className?: string;
}

/**
 * Every panel uses forceMount so closed answers stay in the server HTML (crawlers, JSON-LD
 * parity). Radix then no longer sets `hidden`, so closed panels are hidden here with
 * data-[state=closed]:hidden (display: none, so they are also hidden from assistive technology).
 */
export function Accordion({ items, className }: AccordionProps) {
  return (
    <RadixAccordion.Root type="single" collapsible className={cn('space-y-3', className)}>
      {items.map((item) => (
        <RadixAccordion.Item
          key={item.id}
          value={item.id}
          className="glass-panel overflow-hidden rounded-xl"
        >
          <RadixAccordion.Header className="m-0">
            <RadixAccordion.Trigger className="group flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white">
              <span>{item.question}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-cyan-300 transition-transform group-data-[state=open]:rotate-180"
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content
            forceMount
            className="px-5 pb-5 text-slate-300 data-[state=closed]:hidden"
          >
            {item.answer}
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
