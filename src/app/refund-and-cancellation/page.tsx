import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { refundDocument } from '@/content/legal/refund-and-cancellation';
import { buildRouteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildRouteMetadata(refundDocument.path);

export default function Page() {
  return <LegalPage doc={refundDocument} />;
}
