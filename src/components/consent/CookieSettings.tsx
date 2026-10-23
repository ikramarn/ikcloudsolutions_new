'use client';

import { useConsent } from '@/components/consent/ConsentProvider';

/** Footer button that reopens the cookie banner so a choice can be changed. */
export function CookieSettings({ className }: { className?: string }) {
  const { reopen } = useConsent();
  return (
    <button type="button" onClick={reopen} className={className}>
      Cookie settings
    </button>
  );
}
