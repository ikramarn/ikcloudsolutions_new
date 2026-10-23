import type { MetadataRoute } from 'next';
import { deploymentTier } from '@/config/tier';
import { siteConfig } from '@/config/site';

// production and local (next start, CI, Lighthouse) are indexable; preview blocks everything and
// publishes no sitemap. /academy is deliberately not disallowed: a crawl block would hide its
// noindex tag.
export default function robots(): MetadataRoute.Robots {
  if (deploymentTier() === 'preview') {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
