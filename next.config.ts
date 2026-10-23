import type { NextConfig } from 'next';
// Relative import on purpose: next.config.ts cannot use the @/ path alias.
import { redirectRules } from './src/config/redirects';
import { buildHeaders, deploymentTier, resolveSiteUrl } from './src/config/tier';

const tier = deploymentTier();
const siteUrl = resolveSiteUrl();

const hasTurnstileSecret = Boolean(process.env.TURNSTILE_SECRET_KEY);
const hasTurnstileSiteKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

if (hasTurnstileSecret && !hasTurnstileSiteKey) {
  console.warn(
    '[config] TURNSTILE_SECRET_KEY is set but NEXT_PUBLIC_TURNSTILE_SITE_KEY is not: the widget cannot render and every lead would be rejected.',
  );
}
if (tier === 'production' && !hasTurnstileSecret) {
  console.warn(
    '[config] Production build without TURNSTILE_SECRET_KEY: lead forms will not be protected by Turnstile.',
  );
}

const nextConfig: NextConfig = {
  // Only the Playwright suite sets this: its second build (with a Turnstile site key) must not
  // overwrite the first one. Unset everywhere else, so the default `.next` is used.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    // Resolved once here so server and client bundles see the same canonical origin.
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  redirects() {
    return Promise.resolve(redirectRules.map((rule) => ({ ...rule })));
  },
  headers() {
    return Promise.resolve(buildHeaders(tier, process.env.NODE_ENV));
  },
};

export default nextConfig;
