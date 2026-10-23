import { Check } from 'lucide-react';
import { FeatureGrid } from '@/components/ui/FeatureGrid';
import { Section } from '@/components/ui/Section';
import { StepList } from '@/components/ui/StepList';
import type { AgentSection } from '@/content/agents/sections';
import { renderFaqAnswer } from '@/lib/copy/faq-render';

/** Renders typed page sections. Text may carry {{link:/path|label}} tokens. */
export function AgentSections({ sections }: { sections: readonly AgentSection[] }) {
  return (
    <>
      {sections.map((section, index) => (
        <Section
          key={section.id}
          id={section.id}
          tone={index % 2 === 0 ? 'base' : 'surface'}
          heading={section.heading}
          intro={section.intro ? renderFaqAnswer(section.intro) : undefined}
        >
          {section.features ? (
            <FeatureGrid
              columns={section.features.length === 4 ? 4 : 3}
              features={section.features}
            />
          ) : null}
          {section.steps ? <StepList steps={section.steps} /> : null}
          {section.bullets ? (
            <ul className="space-y-3">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-slate-200">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-cyan-300" />
                  <span>{renderFaqAnswer(bullet)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {section.note ? (
            <p className="mt-6 text-slate-300">{renderFaqAnswer(section.note)}</p>
          ) : null}
        </Section>
      ))}
    </>
  );
}
