import { z } from 'zod';
import { ADDON_IDS, CHANNELS, PLAN_IDS, type AddonId } from '@/config/pricing';
import { firstErrorPerField } from '@/lib/validation/common';
import { BILLING_PERIODS, INDUSTRIES, agentLeadBase, refineIndustry } from '@/lib/validation/lead';

// The AI Front Desk intake wizard validates one step at a time with the same field rules the
// server applies to the final submission. Six steps, in order.
export const intakeSteps = [
  {
    id: 'business',
    title: 'Your business',
    fields: ['businessName', 'websiteUrl', 'hasNoWebsite', 'industry', 'industryOther'],
  },
  { id: 'channels', title: 'Channels', fields: ['channel'] },
  { id: 'plan', title: 'Plan and add-ons', fields: ['plan', 'billing', 'addons'] },
  { id: 'setup', title: 'Set-up', fields: ['setupPreference'] },
  { id: 'contact', title: 'Your details', fields: ['contactName', 'email', 'phone', 'notes'] },
  { id: 'review', title: 'Review and send', fields: ['consent'] },
] as const;

export type IntakeStepId = (typeof intakeSteps)[number]['id'];

const stepSchemas = {
  business: agentLeadBase
    .pick({
      businessName: true,
      websiteUrl: true,
      hasNoWebsite: true,
      industry: true,
      industryOther: true,
    })
    .superRefine(refineIndustry),
  channels: agentLeadBase.pick({ channel: true }),
  plan: agentLeadBase.pick({ plan: true, billing: true, addons: true }),
  setup: agentLeadBase.pick({ setupPreference: true }),
  contact: agentLeadBase.pick({ contactName: true, email: true, phone: true, notes: true }),
  review: agentLeadBase.pick({ consent: true }),
} as const;

/** Field errors for one wizard step (empty object when the step is valid). */
export function validateIntakeStep(step: IntakeStepId, values: unknown): Record<string, string> {
  const result = stepSchemas[step].safeParse(values);
  return result.success ? {} : firstErrorPerField(result.error.issues);
}

/** The wizard step that owns a field, so a server error can send the visitor back to it. */
export function stepIndexForField(field: string): number {
  const index = intakeSteps.findIndex((step) => (step.fields as readonly string[]).includes(field));
  return index === -1 ? intakeSteps.length - 1 : index;
}

const addonIdSchema = z.enum(ADDON_IDS);

const prefillSchema = z.object({
  plan: z.enum(PLAN_IDS).optional().catch(undefined),
  channel: z.enum(CHANNELS).optional().catch(undefined),
  billing: z.enum(BILLING_PERIODS).optional().catch(undefined),
  industry: z.enum(INDUSTRIES).optional().catch(undefined),
});

export type IntakePrefill = z.output<typeof prefillSchema> & {
  /** Valid, unique add-on ids only. */
  addons?: AddonId[] | undefined;
};

/**
 * Query-string pre-fill: invalid or repeated values are ignored, never an error. `addons` is a
 * comma-separated list; unknown ids are dropped.
 */
export function parseIntakePrefill(
  params: Record<string, string | readonly string[] | undefined>,
): IntakePrefill {
  const first = (value: string | readonly string[] | undefined): string | undefined =>
    typeof value === 'string' ? value : value?.[0];
  const base = prefillSchema.parse({
    plan: first(params.plan),
    channel: first(params.channel),
    billing: first(params.billing),
    industry: first(params.industry),
  });
  const addons: AddonId[] = [];
  for (const raw of (first(params.addons) ?? '').split(',')) {
    const parsed = addonIdSchema.safeParse(raw.trim());
    if (parsed.success && !addons.includes(parsed.data)) addons.push(parsed.data);
  }
  return { ...base, addons: addons.length > 0 ? addons : undefined };
}
