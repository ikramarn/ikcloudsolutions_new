import { JsonLd } from '@/components/seo/JsonLd';
import { Accordion } from '@/components/ui/Accordion';
import { Section } from '@/components/ui/Section';
import { buildCopyContext, resolveFaq, type FaqItem } from '@/lib/copy/faq';
import { toAccordionItems } from '@/lib/copy/faq-render';
import { faqJsonLd } from '@/lib/seo/jsonld';

interface FaqSectionProps {
  items: readonly FaqItem[];
  heading?: string;
  tone?: 'base' | 'surface';
}

/**
 * Resolves the FAQ once, then feeds the SAME array to the Accordion and to the FAQPage JSON-LD,
 * so the visible answers and the structured data cannot differ.
 */
export function FaqSection({
  items,
  heading = 'Frequently asked questions',
  tone,
}: FaqSectionProps) {
  const resolved = resolveFaq(items, buildCopyContext());
  return (
    <>
      <Section id="faq" heading={heading} tone={tone ?? 'base'}>
        <Accordion items={toAccordionItems(resolved)} />
      </Section>
      <JsonLd data={faqJsonLd(resolved)} />
    </>
  );
}
