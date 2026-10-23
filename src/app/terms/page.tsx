import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termsDocument } from '@/content/legal/terms';
import { buildRouteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildRouteMetadata(termsDocument.path);

export default function Page() {
  return <LegalPage doc={termsDocument} />;
}
