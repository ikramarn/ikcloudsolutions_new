import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { getStartedHref } from '@/config/links';

interface AgentsHeroProps {
  title: string;
  lead: ReactNode;
  /** Shown on the hub only. */
  preLaunchBadge?: string;
  primaryLabel?: string;
  secondary?: { label: string; href: string };
}

/** The shared hero for AI Front Desk pages. The h1 comes from PageHero. */
export function AgentsHero({
  title,
  lead,
  preLaunchBadge,
  primaryLabel = 'Request your AI Front Desk',
  secondary,
}: AgentsHeroProps) {
  return (
    <PageHero
      eyebrow="AI Front Desk"
      title={title}
      lead={
        <>
          {preLaunchBadge ? (
            <p className="mb-4">
              <Badge tone="new">{preLaunchBadge}</Badge>
            </p>
          ) : null}
          {lead}
        </>
      }
      actions={
        <>
          <Button href={getStartedHref()} size="lg">
            {primaryLabel}
          </Button>
          {secondary ? (
            <Button href={secondary.href} variant="secondary" size="lg">
              {secondary.label}
            </Button>
          ) : null}
        </>
      }
    />
  );
}
