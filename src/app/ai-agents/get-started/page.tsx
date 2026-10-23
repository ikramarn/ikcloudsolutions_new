import type { Metadata } from 'next';
import { Suspense } from 'react';
import { IntakeFormLoader } from '@/components/forms/IntakeFormLoader';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/ai-agents/get-started';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function GetStartedPage() {
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <PageHero
        eyebrow="AI Front Desk"
        title="Request your AI Front Desk"
        lead="Six short steps. We come back with a plan, a quote and a launch timeline. You pay nothing now and no card details are collected here."
      />
      <section aria-label="Request form" className="bg-deep py-12">
        <Container>
          <Suspense fallback={<p className="text-slate-300">Loading the request form...</p>}>
            <IntakeFormLoader />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
