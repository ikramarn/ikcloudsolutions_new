'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { bannerCopy } from '@/components/consent/copy';
import { useConsent } from '@/components/consent/ConsentProvider';
import { analyticsConfig } from '@/config/analytics';
import { asRoute } from '@/config/links';

/**
 * A non-modal region fixed to the bottom of the viewport. It is rendered only after hydration, so
 * it never shifts the server layout, and it never moves focus. Both choices carry equal weight.
 */
export function CookieBanner() {
  const { bannerVisible, accept, reject } = useConsent();
  if (!bannerVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="glass-panel-glow fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 p-4 sm:inset-x-4 sm:bottom-4 sm:rounded-2xl sm:border"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-200">{bannerCopy(analyticsConfig.enabled)}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={reject}>
            Reject non-essential
          </Button>
          <Button variant="secondary" onClick={accept}>
            Accept analytics
          </Button>
          <Link
            href={asRoute('/cookies')}
            className="inline-flex min-h-11 items-center text-sm text-cyan-300 underline underline-offset-2"
          >
            Preferences
          </Link>
        </div>
      </div>
    </div>
  );
}
