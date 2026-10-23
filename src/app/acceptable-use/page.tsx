import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { acceptableUseDocument } from '@/content/legal/acceptable-use';
import { buildRouteMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildRouteMetadata(acceptableUseDocument.path);

export default function Page() {
  return <LegalPage doc={acceptableUseDocument} />;
}
