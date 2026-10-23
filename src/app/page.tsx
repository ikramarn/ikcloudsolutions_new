import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { siteConfig } from '@/config/site';
import { buildRouteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildRouteMetadata('/');

// Placeholder home page: the full home content is built in a later feature.
export default function HomePage() {
  return (
    <PageHero eyebrow="Glenrothes, Scotland" title={siteConfig.name} lead={siteConfig.tagline} />
  );
}
