import type { Metadata } from 'next';
import Link from 'next/link';
import { AcademyAppLazy } from '@/components/academy/AcademyAppLazy';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const PATH = '/academy';

export const metadata: Metadata = buildRouteMetadata(PATH);

export default function AcademyPage() {
  return (
    <>
      <PageBreadcrumbs path={PATH} />
      <PageHero
        eyebrow="Demo"
        title="IK Cloud Academy"
        lead="A demo of how a course library could work. The lessons, quizzes and videos are sample content, and nothing here is a paid course."
      />
      <AcademyAppLazy />
      <Container className="pb-16">
        <p className="text-sm text-slate-300">
          Curious how courses are made? Try the{' '}
          <Link href="/academy/studio" className="text-cyan-300 underline underline-offset-2">
            demo course editor
          </Link>
          . It runs only in your browser.
        </p>
      </Container>
    </>
  );
}
