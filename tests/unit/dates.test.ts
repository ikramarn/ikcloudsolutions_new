import { describe, expect, it } from 'vitest';
import { formatLongDate, isFutureDate } from '@/lib/dates';
import { routes } from '@/config/routes';

describe('dates', () => {
  it('formats ISO dates in UK style', () => {
    expect(formatLongDate('2026-10-22')).toBe('22 October 2026');
  });

  it('detects future dates', () => {
    const now = new Date('2026-10-22T12:00:00Z');
    expect(isFutureDate('2026-10-23', now)).toBe(true);
    expect(isFutureDate('2026-10-22', now)).toBe(false);
  });

  it('has no route with a lastModified in the future', () => {
    for (const route of routes) {
      expect(isFutureDate(route.lastModified), route.path).toBe(false);
    }
  });
});
