import { describe, expect, it } from 'vitest';
import { routes } from '@/config/routes';
import { breadcrumbTrail } from '@/lib/seo/breadcrumbs';

describe('breadcrumbTrail', () => {
  it('starts at Home and ends at the current page', () => {
    expect(breadcrumbTrail('/services')).toEqual([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ]);
  });

  it('works for every registered route and ends at the route itself', () => {
    for (const route of routes) {
      const trail = breadcrumbTrail(route.path);
      expect(trail[0]?.path, route.path).toBe('/');
      expect(trail.at(-1)?.path, route.path).toBe(route.path);
    }
  });

  it('throws for an unknown route', () => {
    expect(() => breadcrumbTrail('/missing')).toThrow(/No route registry entry/);
  });
});
