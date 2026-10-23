// Pure module: NO imports. next.config.ts loads it by relative path (it cannot use the @/ alias),
// and tests call it with explicit env objects. This file is the only reader of VERCEL_ENV.

export type DeploymentTier = 'production' | 'preview' | 'local';

export type EnvSource = Record<string, string | undefined>;

export interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

export function deploymentTier(env: EnvSource = process.env): DeploymentTier {
  if (env.VERCEL_ENV === 'production') return 'production';
  if (env.VERCEL_ENV === 'preview') return 'preview';
  return 'local'; // next dev, next start, CI e2e, Lighthouse
}

function normaliseOrigin(raw: string, label: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`${label} must be an absolute http(s) URL, received "${trimmed}".`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${label} must use http or https, received "${url.protocol}".`);
  }
  return trimmed;
}

export function resolveSiteUrl(env: EnvSource = process.env): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normaliseOrigin(explicit, 'NEXT_PUBLIC_SITE_URL');

  const tier = deploymentTier(env);
  if (tier === 'production') {
    // A wrong canonical host is an SEO defect, so a production build fails loudly.
    throw new Error('NEXT_PUBLIC_SITE_URL is required for production builds.');
  }
  if (tier === 'preview') {
    const vercelUrl = env.VERCEL_URL?.trim();
    if (vercelUrl) return normaliseOrigin(`https://${vercelUrl}`, 'VERCEL_URL');
  }
  return 'http://localhost:3000';
}

const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // No includeSubDomains or preload until every subdomain is confirmed to serve HTTPS.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

function contentSecurityPolicy(nodeEnv: string | undefined): string {
  // 'unsafe-inline' is needed for Next's inline hydration scripts without per-request nonces
  // (nonces would force dynamic rendering). 'unsafe-eval' is development-only.
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(nodeEnv === 'development' ? ["'unsafe-eval'"] : []),
    'https://challenges.cloudflare.com',
  ].join(' ');
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://challenges.cloudflare.com",
    'frame-src https://challenges.cloudflare.com https://www.google.com',
    "media-src 'self' https://commondatastorage.googleapis.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function buildHeaders(tier: DeploymentTier, nodeEnv: string | undefined): HeaderRule[] {
  const rules: HeaderRule[] = [
    {
      source: '/:path*',
      headers: [
        ...SECURITY_HEADERS.map((h) => ({ ...h })),
        { key: 'Content-Security-Policy', value: contentSecurityPolicy(nodeEnv) },
      ],
    },
    {
      source: '/academy/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    },
  ];
  if (tier === 'preview') {
    rules.push({
      source: '/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
    });
  }
  return rules;
}
