// The claims-guard rules table. The scan test and its self-test share this one source, so a regex
// edit that silently stops matching fails the self-test.
export interface GuardRule {
  readonly id: string;
  /** Case-insensitive unless the rule says otherwise. No global flag. */
  readonly re: RegExp;
  /**
   * 'source' = src/**, public text files, docs, README. 'built-html' = rendered HTML (checked in
   * the e2e stage after extractGuardableText). 'both' = either.
   */
  readonly scope: 'source' | 'built-html' | 'both';
  /** File extensions the rule does not apply to. */
  readonly excludeExt?: readonly string[];
  /** Repo-relative path globs where a match is permitted. Exact allow-list, no line exceptions. */
  readonly allow: readonly string[];
  readonly why: string;
}

const ARCHIVE = ['src/data/_unverified-content.ts', 'docs/content-removed-report.md'] as const;

export const RULES: readonly GuardRule[] = [
  {
    id: 'proto-logos',
    re: /\b(apex dynamics|kinetix|hyperion|vektor|lumina)\b/i,
    scope: 'both',
    allow: [...ARCHIVE],
    why: 'prototype fake client logos (also matches the uppercase SVG text APEX DYNAMICS etc.)',
  },
  {
    id: 'legacy-people',
    re: /\b(marcus vance|elena rostova|david macleod|aisha rahman|priya menon|tier-1 fintech)\b/i,
    scope: 'both',
    allow: [...ARCHIVE],
    why: 'fictional people and case studies from the old site',
  },
  {
    id: 'latency-claims',
    re: /\b\d{1,3}\s?ms\b|\bzero latency\b|\b0\s?ms delay\b|neural voice uptime/i,
    scope: 'both',
    excludeExt: ['.css'],
    allow: [...ARCHIVE],
    why: 'millisecond claims in TS/TSX/MDX/HTML. CSS is excluded (transition durations are legitimate). Code that needs a millisecond constant writes a number (delayMs: 400) or 0.4s, never the literal "<digits>ms" in a string or JSX text',
  },
  {
    id: 'uptime-and-volume',
    re: /99\.\d{1,3}\s?%|4\.8M\+?|\b0\s?%\s*hallucination|\bPCI\b|100%\s*white-?label|SYSTEM TELEMETRY|100%\s*Synced|Fortune 500/i,
    scope: 'both',
    allow: [...ARCHIVE],
    why: 'uptime, volume and security-level claims',
  },
  {
    id: 'usd',
    re: /\$\s?\d|\bUSD\b/,
    scope: 'both',
    allow: ['src/config/pricing.ts', ...ARCHIVE],
    why: 'UK/GBP only. The only legitimate USD mentions are the FX note in the pricing cost-basis comment and the archive',
  },
  {
    id: 'card-input',
    re: /autocomplete=["']?cc-|cc-(number|exp|csc|name)|card[-_ ]?number|\bCVC\b|\bCVV\b|cardholder/i,
    scope: 'both',
    allow: [...ARCHIVE],
    why: 'never collect card data',
  },
  {
    id: 'auth-remnants',
    re: /type=["']password["']|type:\s*['"]password['"]|DEFAULT_ACCOUNTS|ikram@ikcloudsolutions\.com|ik_cloud_registered_users/i,
    scope: 'both',
    allow: ['src/lib/academy/purge-legacy.ts', ...ARCHIVE, 'docs/deploy-vercel-and-dns-cutover.md'],
    why: 'no password inputs, no founder account. The legacy storage key may appear only in the purge helper (and the founder email only in the redacted archive or rotation note)',
  },
  {
    id: 'uk-only',
    re: /\b(Pakistan|India|UAE|Dubai|Karachi|Lahore|PKR|AED|INR)\b/,
    scope: 'both',
    allow: ['tests/unit/claims-guard.rules.ts', ...ARCHIVE],
    why: 'UK market only. Case-sensitive on purpose so common words cannot trigger; the list is proper nouns and currency codes',
  },
  {
    id: 'trust-claims',
    re: /\b(trusted by|world-class|best-in-class|military-grade|guaranteed?|zero data loss|zero drift)\b/i,
    scope: 'both',
    allow: [...ARCHIVE, 'src/content/legal/**'],
    why: 'unverifiable superlatives. A bare "100%" is not a rule (it would hit layout and CSS); the specific claims are covered by uptime-and-volume. Legal pages may use "guarantee" in warranty-disclaimer wording',
  },
  {
    id: 'price-literals',
    re: /£\s?\d/,
    scope: 'source',
    allow: [
      'src/config/pricing.ts',
      'src/lib/finops.ts',
      'src/content/finops.ts',
      'src/lib/validation/lead.ts',
      // N-1: the money helpers and pricing maths document their examples with literal amounts.
      'src/lib/money.ts',
      'src/lib/pricing/**',
      'tests/**',
      'docs/**',
    ],
    why: 'prices only from config',
  },
  {
    id: 'pence-and-allowance-literals',
    re: /\b\d+\s?p per (minute|reply)\b|\b\d[\d,]*\s+(voice minutes|AI WhatsApp replies)\b|\b\d{1,2}\s?%\s*(off|discount|saving)\b/i,
    scope: 'both',
    allow: ['src/config/pricing.ts', 'tests/**', 'docs/**', 'src/data/_unverified-content.ts'],
    why: 'allowances, overage and discounts must be rendered from pricing.ts, never typed in FAQ or hub copy. In built HTML the check is inverted: every such figure must be derivable from pricing.ts',
  },
  {
    id: 'vat-phrases',
    re: /excluding VAT|plus VAT|\+\s?VAT|inc\. VAT|including VAT/i,
    scope: 'source',
    allow: ['src/lib/money.ts', 'src/content/legal/**', 'tests/**', 'docs/**'],
    why: 'VAT wording only via vatNote/vatPhrase',
  },
];
