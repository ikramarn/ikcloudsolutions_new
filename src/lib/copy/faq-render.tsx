import Link from 'next/link';
import type { ReactNode } from 'react';
import { asRoute } from '@/config/links';
import type { ResolvedFaqItem } from '@/lib/copy/faq';
import { parseLinkTokens } from '@/lib/copy/link-tokens';

/** Turns a resolved answer into inline text and links (server-rendered, so it is in the HTML). */
export function renderFaqAnswer(answer: string): ReactNode {
  return parseLinkTokens(answer).map((part, index) =>
    part.kind === 'text' ? (
      <span key={index}>{part.value}</span>
    ) : (
      <Link key={index} href={asRoute(part.href)} className="underline underline-offset-2">
        {part.label}
      </Link>
    ),
  );
}

export interface AccordionFaqItem {
  id: string;
  question: string;
  answer: ReactNode;
}

/** Maps the SAME resolved array that feeds faqJsonLd onto Accordion props. */
export function toAccordionItems(items: readonly ResolvedFaqItem[]): AccordionFaqItem[] {
  return items.map((item) => ({
    id: item.id,
    question: item.question,
    answer: renderFaqAnswer(item.answer),
  }));
}
