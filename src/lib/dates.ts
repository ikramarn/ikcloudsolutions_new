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

const londonParts = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Europe/London',
});

/** The Europe/London calendar date for an instant, as YYYY-MM-DD. */
export function londonDate(now: Date): string {
  return londonParts.format(now);
}

/** Adds whole days to a YYYY-MM-DD calendar date (no time zone involved). */
export function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + days));
  return date.toISOString().slice(0, 10);
}

/** True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-30). */
export function isRealIsoDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return addDaysIso(iso, 0) === iso;
}

/** True when an ISO date is later than `now`. Used to keep `lastModified` honest. */
export function isFutureDate(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() > now.getTime();
}
