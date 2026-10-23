import { z } from 'zod';
import { CHANNELS, PLAN_IDS } from '@/config/pricing';
import { firstErrorPerField } from '@/lib/validation/common';
import { BILLING_PERIODS, agentLeadBase, refineIndustry } from '@/lib/validation/lead';

// The AI Front Desk intake wizard validates one step at a time with the same field rules the
// server applies to the final submission.

export const intakeSteps = [
  {
    id: 'business',
    title: 'About your business',
    fields: [
      'businessName',
      'contactName',
      'email',
      'phone',
      'websiteUrl',
      'hasNoWebsite',
      'industry',
      'industryOther',
    ],
  },
  {
    id: 'agent',
    title: 'Your agent',
    fields: ['channel', 'plan', 'billing', 'addons', 'setupPreference'],
  },
  { id: 'review', title: 'Review and send', fields: ['notes', 'consent'] },
] as const;

export type IntakeStepId = (typeof intakeSteps)[number]['id'];

const stepSchemas = {
  business: agentLeadBase
    .pick({
      businessName: true,
      contactName: true,
      email: true,
      phone: true,
      websiteUrl: true,
      hasNoWebsite: true,
      industry: true,
      industryOther: true,
    })
    .superRefine(refineIndustry),
  agent: agentLeadBase.pick({
    channel: true,
    plan: true,
    billing: true,
    addons: true,
    setupPreference: true,
  }),
  review: agentLeadBase.pick({ notes: true, consent: true }),
} as const;

/** Field errors for one wizard step (empty object when the step is valid). */
export function validateIntakeStep(step: IntakeStepId, values: unknown): Record<string, string> {
  const result = stepSchemas[step].safeParse(values);
  return result.success ? {} : firstErrorPerField(result.error.issues);
}

const prefillSchema = z.object({
  plan: z.enum(PLAN_IDS).optional().catch(undefined),
  channel: z.enum(CHANNELS).optional().catch(undefined),
  billing: z.enum(BILLING_PERIODS).optional().catch(undefined),
});

export type IntakePrefill = z.output<typeof prefillSchema>;

/** Query-string pre-fill: invalid or repeated values are ignored, never an error. */
export function parseIntakePrefill(
  params: Record<string, string | readonly string[] | undefined>,
): IntakePrefill {
  const first = (value: string | readonly string[] | undefined): string | undefined =>
    typeof value === 'string' ? value : value?.[0];
  return prefillSchema.parse({
    plan: first(params.plan),
    channel: first(params.channel),
    billing: first(params.billing),
  });
}
