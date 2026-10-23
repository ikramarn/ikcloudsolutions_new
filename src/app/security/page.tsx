import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { securityDocument } from '@/content/legal/security';
import { buildRouteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildRouteMetadata(securityDocument.path);

export default function Page() {
  return <LegalPage doc={securityDocument} />;
}
