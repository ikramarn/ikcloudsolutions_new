import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { breadcrumbTrail } from '@/lib/seo/breadcrumbs';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

/** Visible breadcrumbs plus the matching BreadcrumbList, both from the route registry. */
export function PageBreadcrumbs({ path }: { path: string }) {
  const trail = breadcrumbTrail(path);
  return (
    <>
      <div className="bg-deep pt-4">
        <Container>
          <Breadcrumbs items={trail.map((point) => ({ label: point.name, href: point.path }))} />
        </Container>
      </div>
      <JsonLd data={breadcrumbJsonLd(trail)} />
    </>
  );
}
