'use client';

import { useEffect } from 'react';
import { purgeLegacyStorage } from '@/lib/academy/purge-legacy';

/** Clears data left by the previous version of the site. Renders nothing and never throws. */
export function PurgeLegacyStorage() {
  useEffect(() => {
    purgeLegacyStorage();
  }, []);
  return null;
}
