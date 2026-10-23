import type { CurrencyCode, PriceBook, VatMode } from '@/lib/money';

/**
 * COST BASIS (planning model, 2026-10-22). Revisit before changing any price.
 *
 * FX: £1 = $1.30 (planning assumption). Research costs were in USD.
 * Voice COGS:        $0.11/min today (Retell + LLM + TTS + SIP, incl. 10% overhead) = £0.0846/min.
 *                    Target after moving to a self-assembled stack: $0.07/min = £0.054/min.
 * WhatsApp AI reply: $0.006 per reply (LLM + tools)                             = £0.0046/reply.
 *                    Meta's WhatsApp message fees are NOT our cost: customers pay Meta directly (Tech Provider model).
 * Numbers + channel infra per account/month: Starter £1.54, Pro £3.08, Premium £7.69.
 * Shared infra + observability per account/month: Starter £2.31, Pro £4.62, Premium £11.54.
 * Support labour: £25/h loaded; Starter 0.25h, Pro 1.5h, Premium 5h per month.
 * Payment fees (conservative blended card rate): 3% + 30p per charge.
 *
 * Gross margin at 100% use of BOTH allowances, monthly billing (conservative: a Starter customer
 * activates only ONE channel, so Starter's real worst case is lower cost; single-channel voice worst
 * case = £29.69 cost -> 62.4%; Pro and Premium include both channels so both are counted):
 *   Starter £79:  cost £34.30  -> 56.6%  (both allowances counted)
 *   Pro     £249: cost £118.35 -> 52.5%
 *   Premium £649: cost £320.92 -> 50.6%
 * Annual billing (10% off, paid up front) at 100% use: Starter 52.5%, Pro 47.6%, Premium 45.4%.
 * Typical use is expected to be below allowance (no usage data yet), so real margins should be higher.
 * Overage: voice 20p/min vs £0.0846 cost = 57.7%; AI reply 2p vs £0.0046 cost = 76.9%.
 * Done-for-you setup labour at £25/h: Launch 4-5h (about 69% margin; 5h on £399 = 68.7%), Growth 10-12h (~68%), Premium 25-30h (~62%).
 * Starter's second channel add-on includes that channel's allowance (worst case voice: ~50% margin).
 */

export const PLAN_IDS = ['starter', 'pro', 'premium'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const CHANNELS = ['voice', 'whatsapp', 'both'] as const;
export type Channel = (typeof CHANNELS)[number];

export const SETUP_PACKAGE_IDS = ['launch', 'growth', 'premium-build'] as const;
export type SetupPackageId = (typeof SETUP_PACKAGE_IDS)[number];

export const ADDON_IDS = [
  'website-express',
  'domain',
  'extra-number',
  'meta-verification',
  'kb-essentials',
  'kb-full',
  'extra-language',
  'second-channel',
  'extra-integration',
] as const;
export type AddonId = (typeof ADDON_IDS)[number];

// Voice minutes and chat replies are different fields everywhere. There is intentionally no
// combined "units" field.
export interface PlanAllowances {
  /** Included AI voice minutes per month, available when the voice channel is active. */
  readonly voiceMinutes: number;
  /** Included AI WhatsApp replies per month, available when the WhatsApp channel is active. */
  readonly whatsappAiReplies: number;
  /** Agents or locations. */
  readonly agents: number;
  /** Calendar, CRM or webhook connections. */
  readonly integrations: number;
  readonly changeHoursPerMonth: number;
}

export interface Plan {
  readonly id: PlanId;
  readonly name: string;
  readonly summary: string;
  readonly featured?: boolean;
  readonly channels: 'one-of-voice-or-whatsapp' | 'voice-and-whatsapp';
  readonly monthly: PriceBook;
  readonly setup: {
    readonly packageId: SetupPackageId;
    readonly fee: PriceBook;
    readonly isFrom?: boolean;
  };
  readonly allowances: PlanAllowances;
  readonly overage: {
    // UNIT: tenths of a penny (200 = 20p = £0.20; 20 = 2p = £0.02). NOT pence.
    // Rendered only through displayUnitRate().
    readonly voicePerMinuteTenthsPence: PriceBook;
    readonly whatsappPerReplyTenthsPence: PriceBook;
  };
  /** Qualitative text only: no response-time promises. */
  readonly support: string;
  readonly highlights: readonly string[];
}

export interface SetupPackage {
  readonly id: SetupPackageId;
  readonly name: string;
  readonly fee: PriceBook;
  readonly isFrom?: boolean;
  readonly includes: readonly string[];
  /** Indicative only. */
  readonly typicalTimeline: string;
}

export interface Addon {
  readonly id: AddonId;
  readonly name: string;
  readonly description: string;
  readonly oneTime?: PriceBook;
  readonly monthly?: PriceBook;
  readonly yearly?: PriceBook;
  readonly availability: 'available' | 'coming-soon';
  readonly note?: string;
  readonly planRestriction?: readonly PlanId[];
}

export interface PricingConfig {
  /** Active display currency. */
  readonly currency: CurrencyCode;
  /** ONE flag: mode. Flipping it changes every figure and note consistently. */
  readonly vat: { readonly mode: VatMode; readonly ratePercent: number };
  readonly annualDiscountPercent: number;
  readonly plans: readonly [Plan, Plan, Plan];
  readonly setupPackages: readonly SetupPackage[];
  readonly addons: readonly Addon[];
  /**
   * TODO(verify before launch): confirm this is still the current Meta page for WhatsApp Business
   * pricing. It was not opened while this config was written.
   */
  readonly metaPricingUrl: string;
}

const launchFee: PriceBook = { GBP: 39900 };
const growthFee: PriceBook = { GBP: 94900 };
const premiumBuildFee: PriceBook = { GBP: 195000 };

const overage = {
  voicePerMinuteTenthsPence: { GBP: 200 },
  whatsappPerReplyTenthsPence: { GBP: 20 },
} as const;

export const pricingConfig: PricingConfig = {
  currency: 'GBP',
  vat: { mode: 'exclusive', ratePercent: 20 },
  annualDiscountPercent: 10,
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      summary: 'One channel, set up for a single location.',
      channels: 'one-of-voice-or-whatsapp',
      monthly: { GBP: 7900 },
      setup: { packageId: 'launch', fee: launchFee },
      allowances: {
        voiceMinutes: 200,
        whatsappAiReplies: 1000,
        agents: 1,
        integrations: 1,
        changeHoursPerMonth: 0,
      },
      overage,
      support: 'Email and chat, UK business hours',
      highlights: [
        'Voice or WhatsApp, your choice',
        'One agent for one location',
        'One calendar or CRM connection',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      summary: 'Voice and WhatsApp together, with monthly tuning.',
      featured: true,
      channels: 'voice-and-whatsapp',
      monthly: { GBP: 24900 },
      setup: { packageId: 'growth', fee: growthFee },
      allowances: {
        voiceMinutes: 500,
        whatsappAiReplies: 5000,
        agents: 2,
        integrations: 3,
        changeHoursPerMonth: 1,
      },
      overage,
      support: 'Priority chat, UK business hours',
      highlights: [
        'Voice and WhatsApp on one account',
        'Up to two agents or locations',
        'Monthly tuning time included',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      summary: 'Several locations, deeper integrations and a monthly review.',
      channels: 'voice-and-whatsapp',
      monthly: { GBP: 64900 },
      setup: { packageId: 'premium-build', fee: premiumBuildFee, isFrom: true },
      allowances: {
        voiceMinutes: 1200,
        whatsappAiReplies: 12000,
        agents: 5,
        integrations: 8,
        changeHoursPerMonth: 4,
      },
      overage,
      support: 'Priority support with a monthly review call',
      highlights: [
        'Voice and WhatsApp on one account',
        'Up to five agents or locations',
        'Webhook and extra integrations',
      ],
    },
  ],
  setupPackages: [
    {
      id: 'launch',
      name: 'Launch',
      fee: launchFee,
      includes: [
        'One channel from a niche template',
        'Fact sheet built from your site or a PDF of about 20 pages',
        'One integration',
        'One revision round',
        'A 30-minute handoff call',
      ],
      typicalTimeline: 'Indicative: about 5 business days',
    },
    {
      id: 'growth',
      name: 'Growth',
      fee: growthFee,
      includes: [
        'Voice and WhatsApp',
        'Up to three integrations',
        'Up to three call flows',
        'WhatsApp template pack',
        'Meta verification assistance',
        'Two revision rounds',
        'Staff walkthrough',
      ],
      typicalTimeline: 'Indicative: about 10 business days',
    },
    {
      id: 'premium-build',
      name: 'Premium build',
      fee: premiumBuildFee,
      isFrom: true,
      includes: [
        'Multi-location or multi-language set-up',
        'One custom integration',
        'Optional website',
        'Compliance review',
        'Three revision rounds',
        'Fourteen days of hypercare',
      ],
      typicalTimeline: 'Indicative: about 15 to 20 business days',
    },
  ],
  addons: [
    {
      id: 'website-express',
      name: 'AI website generator',
      description: 'A 3 to 5 page site with hosting and updates, for businesses without one.',
      oneTime: { GBP: 11900 },
      monthly: { GBP: 1500 },
      availability: 'available',
    },
    {
      id: 'domain',
      name: 'Domain registration and connection',
      description: 'We register and connect a domain. You own the registration.',
      yearly: { GBP: 600 },
      availability: 'available',
      note: 'Handling fee only. The registry price varies by extension and is paid at cost.',
    },
    {
      id: 'extra-number',
      name: 'Extra UK phone number',
      description: 'An additional UK number routed to your agent.',
      monthly: { GBP: 500 },
      availability: 'available',
    },
    {
      id: 'meta-verification',
      name: 'Meta business verification assistance',
      description: 'Help completing the business verification WhatsApp needs.',
      oneTime: { GBP: 11900 },
      availability: 'available',
      note: 'Meta decides the outcome. It can take days to weeks.',
    },
    {
      id: 'kb-essentials',
      name: 'Knowledge-base writing (essentials)',
      description: 'We write your agent knowledge base from up to about 20 pages of material.',
      oneTime: { GBP: 14900 },
      availability: 'available',
    },
    {
      id: 'kb-full',
      name: 'Knowledge-base writing (full)',
      description: 'A full knowledge base written from your call recordings.',
      oneTime: { GBP: 39900 },
      availability: 'available',
    },
    {
      id: 'extra-language',
      name: 'Additional language or voice',
      description: 'A second language for your agent.',
      monthly: { GBP: 2500 },
      availability: 'coming-soon',
      note: 'Register interest. Not included in estimates yet.',
    },
    {
      id: 'second-channel',
      name: 'Second channel for Starter',
      description: 'Adds the other channel to Starter, including that channel’s allowance.',
      monthly: { GBP: 3900 },
      availability: 'available',
      planRestriction: ['starter'],
    },
    {
      id: 'extra-integration',
      name: 'Extra calendar or CRM integration',
      description: 'One more connection to a calendar or CRM.',
      oneTime: { GBP: 7900 },
      availability: 'available',
    },
  ],
  metaPricingUrl: 'https://developers.facebook.com/docs/whatsapp/pricing',
};
