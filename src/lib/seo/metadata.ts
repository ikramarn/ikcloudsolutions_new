import type { Metadata } from 'next';
import { findRoute, isIndexable, resolveDescription } from '@/config/routes';
import { siteConfig } from '@/config/site';

export const TITLE_TEMPLATE = '%s | IK Cloud Solutions';
const DEFAULT_OG_IMAGE = '/og/default';

export interface BuildMetadataInput {
  path: string;
  title: string;
  description: string;
  /** Path of the OG card, for example '/og/ai-agents-pricing'. */
  ogImage?: string;
  noindex?: boolean;
  /** The title is complete already: skip the template suffix. */
  titleAbsolute?: boolean;
}

/**
 * Next merges openGraph and twitter shallowly, so a page-level object replaces the parent's
 * images. This helper therefore always emits openGraph.images and twitter.images explicitly.
 */
export function buildMetadata({
  path,
  title,
  description,
  ogImage,
  noindex,
  titleAbsolute,
}: BuildMetadataInput): Metadata {
  const image = ogImage ?? findRoute(path)?.ogImagePath ?? DEFAULT_OG_IMAGE;
  const fullTitle = titleAbsolute ? title : `${title} | ${siteConfig.name}`;
  const images = [{ url: image, width: 1200, height: 630, alt: fullTitle }];

  return {
    metadataBase: new URL(siteConfig.url),
    title: titleAbsolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale: 'en_GB',
      url: path,
      title: fullTitle,
      description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images,
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Metadata for a page in the route registry, so titles and descriptions cannot drift. */
export function buildRouteMetadata(path: string): Metadata {
  const entry = findRoute(path);
  if (!entry) throw new Error(`No route registry entry for "${path}".`);
  return buildMetadata({
    path: entry.path,
    title: entry.title,
    description: resolveDescription(entry),
    ogImage: entry.ogImagePath,
    noindex: !isIndexable(entry),
    titleAbsolute: entry.titleAbsolute ?? false,
  });
}
