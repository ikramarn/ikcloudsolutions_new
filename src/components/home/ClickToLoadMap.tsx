'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { contactContent } from '@/content/contact';

/** The Google iframe is not rendered until the visitor asks for it. */
export function ClickToLoadMap() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="space-y-3">
      {loaded ? (
        <iframe
          title={contactContent.mapTitle}
          src={contactContent.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-64 w-full rounded-xl border border-white/10"
        />
      ) : (
        <div className="rounded-xl border border-white/10 bg-surface p-5">
          <p className="text-sm text-slate-300">{contactContent.mapNotice}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => setLoaded(true)} variant="secondary">
              {contactContent.loadMap}
            </Button>
          </div>
        </div>
      )}
      <a
        href={contactContent.mapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center font-semibold text-cyan-300 underline underline-offset-2"
      >
        {contactContent.openInMaps}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
