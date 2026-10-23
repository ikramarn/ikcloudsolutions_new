import { z } from 'zod';
import { siteConfig } from '@/config/site';

// Client-safe public environment. Each NEXT_PUBLIC_* variable is referenced literally so Next can
// inline it into the client bundle. The deployment tier lives in src/config/tier.ts.
const optionalUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const parsed = z.url({ protocol: /^https?$/ }).safeParse(value.trim());
  return parsed.success ? parsed.data.replace(/\/+$/, '') : undefined;
};

export const publicEnv = {
  siteUrl: siteConfig.url,
  // Undefined until the customer app exists.
  appUrl: optionalUrl(process.env.NEXT_PUBLIC_APP_URL),
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined,
} as const;
