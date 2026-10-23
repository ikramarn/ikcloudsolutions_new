import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Container } from '@/components/ui/Container';
import { DraftBanner } from '@/components/ui/DraftBanner';
import { PageHero } from '@/components/ui/PageHero';
import { Prose } from '@/components/ui/Prose';
import type { LegalDocument } from '@/content/legal/types';
import { formatLongDate } from '@/lib/dates';

/**
 * Shared layout for the seven legal pages: breadcrumbs, a single h1, the draft banner (shown
 * while siteConfig.legalReviewed is false), a table of contents and the prose body.
 */
export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <>
      <PageBreadcrumbs path={doc.path} />
      <PageHero title={doc.title} lead={doc.lead} />
      <div className="bg-deep py-12 sm:py-16">
        <Container>
          <DraftBanner />
          <p className="mb-8 text-sm text-slate-300">
            Last updated: <time dateTime={doc.lastUpdated}>{formatLongDate(doc.lastUpdated)}</time>
          </p>
          <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
            <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="mb-3 font-mono text-xs font-bold tracking-wider text-white uppercase">
                On this page
              </h2>
              <ol className="space-y-1 text-sm">
                {doc.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="inline-flex min-h-8 items-center text-slate-300 hover:text-white hover:underline"
                    >
                      {index + 1}. {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <Prose>
              {doc.sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2>
                    {index + 1}. {section.heading}
                  </h2>
                  <div className="space-y-4">{section.body}</div>
                </section>
              ))}
            </Prose>
          </div>
        </Container>
      </div>
    </>
  );
}
