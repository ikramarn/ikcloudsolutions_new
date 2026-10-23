const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** '2026-10-22' -> '22 October 2026' (UK format, UTC so server and client agree). */
export function formatLongDate(iso: string): string {
  return longDate.format(new Date(iso));
}

/** True when an ISO date is later than `now`. Used to keep `lastModified` honest. */
export function isFutureDate(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() > now.getTime();
}
