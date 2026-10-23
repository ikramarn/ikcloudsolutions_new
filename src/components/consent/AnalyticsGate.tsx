'use client';

import type { ReactNode } from 'react';
import { useConsent } from '@/components/consent/ConsentProvider';
import { analyticsConfig } from '@/config/analytics';

/** Renders children only when analytics is enabled in config AND the visitor accepted it. */
export function AnalyticsGate({ children }: { children: ReactNode }) {
  const { record } = useConsent();
  if (!analyticsConfig.enabled || record?.analytics !== true) return null;
  return <>{children}</>;
}
