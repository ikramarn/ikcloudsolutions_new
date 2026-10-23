import { Badge } from '@/components/ui/Badge';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { siteConfig } from '@/config/site';

/** Shown on legal pages until siteConfig.legalReviewed is set. */
export function DraftBanner() {
  if (siteConfig.legalReviewed) return null;
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <Badge tone="draft">Draft</Badge>
      <Disclaimer variant="draft" className="flex-1" />
    </div>
  );
}
