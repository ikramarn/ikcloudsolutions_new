'use client';

import { useSearchParams } from 'next/navigation';
import { IntakeForm } from '@/components/forms/IntakeForm';
import { parseIntakePrefill } from '@/lib/validation/intake';

/**
 * Reads the query string on the client, so the page itself stays static. Invalid values are
 * ignored and unknown add-on ids are dropped. Render inside a Suspense boundary.
 */
export function IntakeFormLoader() {
  const searchParams = useSearchParams();
  const prefill = parseIntakePrefill(Object.fromEntries(searchParams.entries()));
  return <IntakeForm prefill={prefill} />;
}
