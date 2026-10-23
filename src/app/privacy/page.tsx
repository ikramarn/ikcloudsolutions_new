import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacyDocument } from '@/content/legal/privacy';
import { buildRouteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildRouteMetadata(privacyDocument.path);

export default function Page() {
  return <LegalPage doc={privacyDocument} />;
}
