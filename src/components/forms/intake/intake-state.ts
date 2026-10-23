import {
  pricingConfig,
  type Addon,
  type AddonId,
  type Channel,
  type PlanId,
  type PricingConfig,
} from '@/config/pricing';
import type { EstimateSelection } from '@/lib/pricing';
import type { BillingPeriod } from '@/lib/money';
import type { IntakePrefill } from '@/lib/validation/intake';

export type IndustryChoice = 'clinics' | 'estate-agents' | 'home-services' | 'other';
type PlanChoice = PlanId | 'not-sure';
type SetupPreference = 'done-for-you' | 'self-serve-later';

/** Everything the wizard holds in memory. Nothing is stored in the browser. */
export interface IntakeValues {
  businessName: string;
  websiteUrl: string;
  hasNoWebsite: boolean;
  industry: IndustryChoice | '';
  industryOther: string;
  channel: Channel | '';
  plan: PlanChoice | '';
  billing: BillingPeriod;
  /** The visitor's own add-on choices. Plan-driven additions are derived, not stored here. */
  addons: AddonId[];
  setupPreference: SetupPreference;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
  consent: boolean;
  marketingOptIn: boolean;
}

export function initialValues(prefill: IntakePrefill = {}): IntakeValues {
  return {
    businessName: '',
    websiteUrl: '',
    hasNoWebsite: prefill.addons?.includes('website-express') ?? false,
    industry: prefill.industry ?? '',
    industryOther: '',
    channel: prefill.channel ?? '',
    plan: prefill.plan ?? '',
    billing: prefill.billing ?? 'monthly',
    addons: [...(prefill.addons ?? [])],
    setupPreference: 'done-for-you',
    contactName: '',
    email: '',
    phone: '',
    notes: '',
    consent: false,
    marketingOptIn: false,
  };
}

/** Starter with both channels needs the second-channel add-on, so it is added and locked. */
function isSecondChannelLocked(values: Pick<IntakeValues, 'plan' | 'channel'>): boolean {
  return values.plan === 'starter' && values.channel === 'both';
}

export interface AddonAvailability {
  disabled: boolean;
  checked: boolean;
  reason?: string;
}

/** Why an add-on cannot be chosen, if it cannot. Coming-soon and plan-restricted add-ons are disabled. */
export function addonAvailability(
  addon: Addon,
  values: Pick<IntakeValues, 'plan' | 'channel' | 'addons'>,
  config: PricingConfig = pricingConfig,
): AddonAvailability {
  if (addon.availability === 'coming-soon') {
    return {
      disabled: true,
      checked: false,
      reason:
        'Coming soon. Mention it in your notes if you would like us to register your interest.',
    };
  }
  if (addon.id === 'second-channel' && isSecondChannelLocked(values)) {
    return {
      disabled: true,
      checked: true,
      reason: 'Added because Starter with both channels needs it.',
    };
  }
  const plan = values.plan;
  if (
    addon.planRestriction &&
    plan !== '' &&
    plan !== 'not-sure' &&
    !addon.planRestriction.includes(plan)
  ) {
    const names = addon.planRestriction
      .map((id) => config.plans.find((candidate) => candidate.id === id)?.name ?? id)
      .join(' or ');
    return { disabled: true, checked: false, reason: `Only available with ${names}.` };
  }
  return { disabled: false, checked: values.addons.includes(addon.id) };
}

/** The add-ons that actually apply: the visitor's selectable choices plus any locked ones. */
export function effectiveAddons(
  values: Pick<IntakeValues, 'plan' | 'channel' | 'addons'>,
  config: PricingConfig = pricingConfig,
): AddonId[] {
  return config.addons
    .filter((addon) => {
      const state = addonAvailability(addon, values, config);
      return state.checked && (!state.disabled || addon.id === 'second-channel');
    })
    .map((addon) => addon.id);
}

/**
 * The estimate selection, or null until a plan and a channel are chosen. The setup fee only
 * counts once the visitor has finished the set-up step.
 */
export function toEstimateSelection(
  values: IntakeValues,
  setupDone: boolean,
  config: PricingConfig = pricingConfig,
): EstimateSelection | null {
  if (values.plan === '' || values.channel === '') return null;
  return {
    planId: values.plan,
    billing: values.billing,
    channel: values.channel,
    setupPreference: setupDone ? values.setupPreference : 'self-serve-later',
    addonIds: effectiveAddons(values, config),
  };
}

/** The JSON body for POST /api/lead (type "agent-lead"), without honeypot or token. */
export function buildPayload(values: IntakeValues): Record<string, unknown> {
  return {
    type: 'agent-lead',
    contactName: values.contactName,
    businessName: values.businessName,
    email: values.email,
    phone: values.phone,
    websiteUrl: values.hasNoWebsite ? '' : values.websiteUrl,
    hasNoWebsite: values.hasNoWebsite,
    industry: values.industry,
    industryOther: values.industry === 'other' ? values.industryOther : '',
    channel: values.channel,
    plan: values.plan,
    billing: values.billing,
    addons: effectiveAddons(values),
    setupPreference: values.setupPreference,
    notes: values.notes,
    consent: values.consent,
    marketingOptIn: values.marketingOptIn,
  };
}
