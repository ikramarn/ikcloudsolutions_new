import { findRoute } from '@/config/routes';
import type { BreadcrumbPoint } from '@/lib/seo/jsonld';

/** Home first, current page last, built from the registry parents. */
export function breadcrumbTrail(path: string): BreadcrumbPoint[] {
  const trail: BreadcrumbPoint[] = [];
  let current = findRoute(path);
  if (!current) throw new Error(`No route registry entry for "${path}".`);
  while (current) {
    const name = current.path === '/' ? 'Home' : (current.breadcrumbLabel ?? current.title);
    trail.unshift({ name, path: current.path });
    current = current.parent ? findRoute(current.parent) : undefined;
  }
  return trail;
}
