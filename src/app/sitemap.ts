import type { MetadataRoute } from 'next';
import { isIndexable, routes } from '@/config/routes';
import { siteConfig } from '@/config/site';

// Indexable routes only (the Academy and, until legalReviewed is set, the legal pages are left
// out). No priority or changeFrequency: search engines ignore them.
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.filter(isIndexable).map((route) => ({
    url: `${siteConfig.url}${route.path === '/' ? '' : route.path}`,
    lastModified: route.lastModified,
  }));
}
