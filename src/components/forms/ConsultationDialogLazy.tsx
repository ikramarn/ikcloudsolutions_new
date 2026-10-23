'use client';

import dynamic from 'next/dynamic';

// Loaded on the first open() so the form, Radix Dialog content and Turnstile stay out of the
// initial bundle. ssr is off because the dialog only ever renders after a click.
export const ConsultationDialogLazy = dynamic(
  () => import('@/components/forms/ConsultationDialog').then((module) => module.ConsultationDialog),
  { ssr: false },
);
