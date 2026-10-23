import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { analyticsConfig } from '@/config/analytics';
import { cookiesDocument } from '@/content/legal/cookies';
import { buildRouteMetadata } from '@/lib/seo/metadata';

const doc = cookiesDocument(analyticsConfig.enabled);

export const metadata: Metadata = buildRouteMetadata(doc.path);

export default function CookiesPage() {
  return <LegalPage doc={doc} />;
}
