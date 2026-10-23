import { siteConfig } from '@/config/site';

// Single route registry: the source for metadata, sitemap entries, breadcrumbs, nav checks and
// the e2e route list. Page routes only (API, /og/*, sitemap, robots, manifest and icons are not
// entries). Later features append their routes here.
export interface RouteEntry {
  /** '/ai-agents/pricing' */
  path: string;
  /** Page segment of <title>; the template adds the suffix unless `titleAbsolute` is set. */
  title: string;
  /** True when `title` is already complete (home, about) and skips the template. */
  titleAbsolute?: boolean;
  /** 70 to 160 characters after resolution. A function only for config-derived copy. */
  description: string | (() => string);
  indexable: boolean | 'when-legal-reviewed';
  /** ISO date, edited by hand when content changes. Never in the future. */
  lastModified: string;
  /** Short label for breadcrumbs. Falls back to `title` when omitted. */
  breadcrumbLabel?: string;
  /** Breadcrumb parent: MUST be an existing registry path. */
  parent?: string;
  /** '/og/<card>' of this route's own card, or the nearest parent's. */
  ogImagePath: string;
}

export const routes: readonly RouteEntry[] = [
  {
    path: '/',
    title: 'IK Cloud Solutions | Cloud, DevOps and AI Agents',
    titleAbsolute: true,
    description:
      'Scotland-based cloud and DevOps consultancy. Multi-cloud, Kubernetes, FinOps and security services, plus managed AI receptionists for UK businesses.',
    indexable: true,
    lastModified: '2026-10-22',
    ogImagePath: '/og/home',
  },
  {
    path: '/services',
    title: 'Cloud, DevOps and FinOps Services',
    description:
      'Multi-cloud DevOps, GitOps, cloud migration, FinOps, DevSecOps and senior engineering support from a Glenrothes-based consultancy.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Services',
    parent: '/',
    ogImagePath: '/og/services',
  },
  {
    path: '/about',
    title: 'About | IK Cloud Solutions, Glenrothes',
    titleAbsolute: true,
    description:
      'IK Cloud Solutions is a founder-led cloud and DevOps consultancy in Glenrothes, Scotland. Meet Ikram Ullah and see how we work.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'About',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/contact',
    title: 'Contact IK Cloud Solutions',
    description:
      'Contact IK Cloud Solutions at 35 Napier Road, Glenrothes KY6 1DS, or send an enquiry about cloud, DevOps or AI agents.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Contact',
    parent: '/',
    ogImagePath: '/og/default',
  },
];

export function findRoute(path: string): RouteEntry | undefined {
  return routes.find((route) => route.path === path);
}

export function resolveDescription(entry: RouteEntry): string {
  return typeof entry.description === 'function' ? entry.description() : entry.description;
}

export function isIndexable(entry: RouteEntry): boolean {
  if (entry.indexable === 'when-legal-reviewed') return siteConfig.legalReviewed;
  return entry.indexable;
}
