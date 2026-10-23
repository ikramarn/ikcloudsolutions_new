// Site-wide facts. No secrets: this module is safe for client bundles.
// NEXT_PUBLIC_SITE_URL is resolved once in next.config.ts (see src/config/tier.ts) and injected
// through Next's `env` option, so server and client bundles agree on the canonical origin.
export const siteConfig = {
  name: 'IK Cloud Solutions',
  // Not "Ltd" until the legal entity is confirmed. Rendered only when set.
  legalName: undefined as string | undefined,
  tagline: 'Cloud, DevOps and AI agents for UK businesses',
  locale: 'en-GB',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? '',
  email: 'admin@ikcloudsolutions.com',
  // Optional public phone number. Rendered only when set.
  phone: undefined as string | undefined,
  address: {
    street: '35 Napier Road',
    locality: 'Glenrothes',
    region: 'Fife',
    postalCode: 'KY6 1DS',
    country: 'GB',
    countryName: 'Scotland, United Kingdom',
  },
  // The values below are rendered only when set.
  companyNumber: undefined as string | undefined,
  registeredOffice: undefined as string | undefined,
  vatNumber: undefined as string | undefined,
  icoRegistrationNumber: undefined as string | undefined,
  // Flips DRAFT banners off and legal pages to indexable.
  legalReviewed: false,
  founder: {
    name: 'Ikram Ullah',
    role: 'Founder and CEO',
    image: '/images/team/ikram-ullah.jpg',
  },
  // Verified profile URLs only.
  sameAs: [] as readonly string[],
} as const;
