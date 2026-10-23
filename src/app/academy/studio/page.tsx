import type { Metadata } from 'next';
import { TrainerStudioLazy } from '@/components/academy/TrainerStudioLazy';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { PageHero } from '@/components/ui/PageHero';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/academy/studio';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function AcademyStudioPage() {
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <PageHero
        eyebrow="Demo"
        title="Academy course editor"
        lead="Create, edit and delete demo courses. Everything stays in your browser and nothing is sent to our servers."
      />
      <TrainerStudioLazy />
    </>
  );
}
