import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { dpaSummaryDocument } from '@/content/legal/dpa-summary';
import { buildRouteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildRouteMetadata(dpaSummaryDocument.path);

export default function Page() {
  return <LegalPage doc={dpaSummaryDocument} />;
}
