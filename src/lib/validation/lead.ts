import { z } from 'zod';
import { ADDON_IDS, CHANNELS, PLAN_IDS } from '@/config/pricing';
import { addDaysIso, isRealIsoDate, londonDate } from '@/lib/dates';
import {
  cleanSingleLine,
  clientReferenceField,
  emailField,
  honeypotField,
  marketingOptInField,
  multilineText,
  optionalMultiline,
  optionalText,
  optionalUrl,
  phoneField,
  requiredText,
  turnstileTokenField,
} from '@/lib/validation/common';

export const LEAD_TYPES = ['contact', 'consultation', 'agent-lead'] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const SERVICE_INTERESTS = [
  'Multi-cloud DevOps',
  'FinOps review',
  'Cloud migration',
  'DevSecOps',
  'Staffing',
  'Academy',
  'AI Front Desk',
] as const;
export type ServiceInterest = (typeof SERVICE_INTERESTS)[number];

export const CLOUD_PROVIDERS = [
  'AWS',
  'Azure',
  'GCP',
  'Oracle',
  'Multi-cloud',
  'Not sure',
] as const;

export const MONTHLY_SPEND_BANDS = [
  'Under £5k',
  '£5k-£25k',
  '£25k-£100k',
  'Over £100k',
  'Not sure',
] as const;

export const TIME_WINDOWS = ['morning', 'afternoon', 'evening'] as const;
export const INDUSTRIES = ['clinics', 'estate-agents', 'home-services', 'other'] as const;
export const BILLING_PERIODS = ['monthly', 'annual'] as const;
export const SETUP_PREFERENCES = ['done-for-you', 'self-serve-later'] as const;
export const PLAN_CHOICES = [...PLAN_IDS, 'not-sure'] as const;

const PREFERRED_DATE_WINDOW_DAYS = 90;
const CHOOSE = { error: 'Choose an option' };

const common = {
  hp_confirm_ref: honeypotField,
  turnstileToken: turnstileTokenField,
  clientReference: clientReferenceField,
  marketingOptIn: marketingOptInField,
};

const contactShape = {
  type: z.literal('contact'),
  ...common,
  firstName: requiredText('First name', 1, 60),
  lastName: requiredText('Last name', 1, 60),
  email: emailField,
  subject: requiredText('Subject', 3, 120),
  interest: z.enum(SERVICE_INTERESTS, CHOOSE),
  message: multilineText('Message', 10, 4000),
};

export const contactSchema = z.strictObject(contactShape);

/** preferredDate must be today or later (Europe/London) and within 90 days. */
function preferredDateField(now: () => Date) {
  return z
    .string()
    .transform(cleanSingleLine)
    .superRefine((value, ctx) => {
      if (value === '') return;
      if (!isRealIsoDate(value)) {
        ctx.addIssue({ code: 'custom', message: 'Choose a valid date' });
        return;
      }
      const today = londonDate(now());
      if (value < today) {
        ctx.addIssue({ code: 'custom', message: 'Choose today or a later date' });
      } else if (value > addDaysIso(today, PREFERRED_DATE_WINDOW_DAYS)) {
        ctx.addIssue({
          code: 'custom',
          message: `Choose a date within the next ${PREFERRED_DATE_WINDOW_DAYS} days`,
        });
      }
    })
    .transform((value) => (value === '' ? undefined : value))
    .optional();
}

/** The clock is injected so tests never depend on today's date. */
export function createConsultationSchema(now: () => Date = () => new Date()) {
  return z.strictObject({
    type: z.literal('consultation'),
    ...common,
    name: requiredText('Name', 2, 100),
    email: emailField,
    phone: phoneField,
    company: optionalText('Company', 120),
    roleTitle: optionalText('Role', 100),
    focus: z.enum(SERVICE_INTERESTS, CHOOSE),
    cloudProvider: z.enum(CLOUD_PROVIDERS, CHOOSE),
    monthlySpend: z.enum(MONTHLY_SPEND_BANDS, CHOOSE),
    preferredDate: preferredDateField(now),
    preferredTimeWindow: z.enum(TIME_WINDOWS, CHOOSE),
    notes: optionalMultiline('Notes', 2000),
  });
}

const uniqueAddons = z
  .array(z.enum(ADDON_IDS))
  .max(ADDON_IDS.length, 'Too many add-ons')
  .refine((ids) => new Set(ids).size === ids.length, 'Each add-on can only be chosen once');

export const agentLeadShape = {
  type: z.literal('agent-lead'),
  ...common,
  contactName: requiredText('Your name', 2, 100),
  businessName: requiredText('Business name', 2, 120),
  email: emailField,
  phone: phoneField,
  websiteUrl: optionalUrl,
  hasNoWebsite: z.boolean().default(false),
  industry: z.enum(INDUSTRIES, CHOOSE),
  industryOther: optionalText('Industry', 80),
  channel: z.enum(CHANNELS, CHOOSE),
  plan: z.enum(PLAN_CHOICES, CHOOSE),
  billing: z.enum(BILLING_PERIODS).default('monthly'),
  addons: uniqueAddons.default([]),
  setupPreference: z.enum(SETUP_PREFERENCES, CHOOSE),
  notes: optionalMultiline('Notes', 2000),
  consent: z.literal(true, { error: 'Please confirm you agree to us using your details' }),
};

/** "Other" industry needs a description (error on industryOther). */
export function refineIndustry(
  value: { industry: string; industryOther?: string | undefined },
  ctx: z.RefinementCtx,
): void {
  if (value.industry === 'other' && !value.industryOther) {
    ctx.addIssue({ code: 'custom', path: ['industryOther'], message: 'Tell us your industry' });
  }
}

/** A stale website typed before ticking "no website" never reaches the email. */
export function refineWebsite<T extends { hasNoWebsite: boolean; websiteUrl?: string | undefined }>(
  value: T,
): T {
  return value.hasNoWebsite ? { ...value, websiteUrl: undefined } : value;
}

/** industryOther only means something when the industry is "other". */
function discardIndustryOther<T extends { industry: string; industryOther?: string | undefined }>(
  value: T,
): T {
  return value.industry === 'other' ? value : { ...value, industryOther: undefined };
}

function applyAgentLeadRules<
  T extends {
    hasNoWebsite: boolean;
    websiteUrl?: string | undefined;
    industry: string;
    industryOther?: string | undefined;
  },
>(value: T): T {
  return discardIndustryOther(refineWebsite(value));
}

export const agentLeadBase = z.strictObject(agentLeadShape);
const agentLeadObject = agentLeadBase.superRefine(refineIndustry);

export const agentLeadSchema = agentLeadObject.transform(applyAgentLeadRules);

/** The server schema: discriminated on `type`, strict, with the conditional discards applied. */
export function createLeadSchema(now: () => Date = () => new Date()) {
  return z
    .discriminatedUnion('type', [contactSchema, createConsultationSchema(now), agentLeadObject])
    .transform((value) => (value.type === 'agent-lead' ? applyAgentLeadRules(value) : value));
}

export type Lead = z.output<ReturnType<typeof createLeadSchema>>;
export type ContactLead = Extract<Lead, { type: 'contact' }>;
export type ConsultationLead = Extract<Lead, { type: 'consultation' }>;
export type AgentLead = Extract<Lead, { type: 'agent-lead' }>;
