import Link from 'next/link';
import type { ReactNode } from 'react';
import { Checkbox, Input, RadioGroup, Textarea } from '@/components/ui/FormControls';
import { FormField } from '@/components/ui/FormField';
import { asRoute } from '@/config/links';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { addonPriceText } from '@/lib/pricing/addon-price';
import {
  addonAvailability,
  type IntakeValues,
  type IndustryChoice,
} from '@/components/forms/intake/intake-state';

export interface StepProps {
  values: IntakeValues;
  errors: Record<string, string>;
  update: (patch: Partial<IntakeValues>) => void;
}

const INDUSTRY_LABELS: Record<IndustryChoice, string> = {
  clinics: 'Private or dental clinic',
  'estate-agents': 'Estate agent (lettings and sales)',
  'home-services': 'Home services (plumber, electrician, heating engineer)',
  other: 'Something else',
};

export const CHANNEL_LABELS = {
  voice: 'Voice: an AI receptionist for phone calls',
  whatsapp: 'WhatsApp: an AI assistant for your business WhatsApp number',
  both: 'Both voice and WhatsApp',
} as const;

export function industryLabel(industry: string): string {
  return industry in INDUSTRY_LABELS ? INDUSTRY_LABELS[industry as IndustryChoice] : industry;
}

export function BusinessStep({ values, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <FormField label="Business name" required error={errors.businessName}>
        {(control) => (
          <Input
            name="businessName"
            autoComplete="organization"
            value={values.businessName}
            onChange={(event) => update({ businessName: event.target.value })}
            {...control}
          />
        )}
      </FormField>
      <FormField
        label="Website address"
        hint="Optional. Include the full address if you have one."
        error={errors.websiteUrl}
      >
        {(control) => (
          <Input
            name="websiteUrl"
            inputMode="url"
            autoComplete="url"
            disabled={values.hasNoWebsite}
            value={values.hasNoWebsite ? '' : values.websiteUrl}
            onChange={(event) => update({ websiteUrl: event.target.value })}
            {...control}
          />
        )}
      </FormField>
      <Checkbox
        name="hasNoWebsite"
        label="I do not have a website yet"
        checked={values.hasNoWebsite}
        onChange={(event) => {
          const checked = event.target.checked;
          // Suggest the website add-on; the visitor can untick it on the plan step.
          const addons = checked
            ? Array.from(new Set([...values.addons, 'website-express' as const]))
            : values.addons;
          update({ hasNoWebsite: checked, addons });
        }}
      />
      <RadioGroup
        name="industry"
        legend="Industry"
        required
        value={values.industry}
        onChange={(value) => update({ industry: value as IndustryChoice })}
        error={errors.industry}
        options={(Object.keys(INDUSTRY_LABELS) as IndustryChoice[]).map((value) => ({
          value,
          label: INDUSTRY_LABELS[value],
        }))}
      />
      {values.industry === 'other' ? (
        <FormField label="Tell us your industry" required error={errors.industryOther}>
          {(control) => (
            <Input
              name="industryOther"
              value={values.industryOther}
              onChange={(event) => update({ industryOther: event.target.value })}
              {...control}
            />
          )}
        </FormField>
      ) : null}
    </div>
  );
}

export function ChannelStep({ values, errors, update }: StepProps) {
  return (
    <RadioGroup
      name="channel"
      legend="Which channels do you want?"
      required
      value={values.channel}
      onChange={(value) => update({ channel: value as IntakeValues['channel'] })}
      error={errors.channel}
      options={(Object.keys(CHANNEL_LABELS) as (keyof typeof CHANNEL_LABELS)[]).map((value) => ({
        value,
        label: CHANNEL_LABELS[value],
      }))}
    />
  );
}

interface PlanStepProps extends StepProps {
  config?: PricingConfig;
}

export function PlanStep({ values, errors, update, config = pricingConfig }: PlanStepProps) {
  const toggleAddon = (id: IntakeValues['addons'][number], checked: boolean) => {
    const without = values.addons.filter((existing) => existing !== id);
    update({ addons: checked ? [...without, id] : without });
  };
  return (
    <div className="space-y-6">
      <RadioGroup
        name="plan"
        legend="Which plan suits you?"
        required
        value={values.plan}
        onChange={(value) => update({ plan: value as IntakeValues['plan'] })}
        error={errors.plan}
        options={[
          ...config.plans.map((plan) => ({
            value: plan.id,
            label: (
              <span>
                <strong className="text-white">{plan.name}</strong>
                <span className="block text-sm text-slate-300">{plan.summary}</span>
              </span>
            ),
          })),
          {
            value: 'not-sure',
            label: (
              <span>
                <strong className="text-white">Not sure yet</strong>
                <span className="block text-sm text-slate-300">
                  We will recommend a plan. No figures are shown.
                </span>
              </span>
            ),
          },
        ]}
      />
      <RadioGroup
        name="billing"
        legend="How would you like to pay for the plan?"
        value={values.billing}
        onChange={(value) => update({ billing: value as IntakeValues['billing'] })}
        error={errors.billing}
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'annual', label: `Annual, save ${config.annualDiscountPercent}%` },
        ]}
      />
      <fieldset className="space-y-1">
        <legend className="mb-2 text-sm font-semibold text-slate-100">Add-ons</legend>
        {config.addons.map((addon) => {
          const state = addonAvailability(addon, values, config);
          const price = addon.availability === 'coming-soon' ? '' : addonPriceText(addon, config);
          return (
            <div key={addon.id}>
              <Checkbox
                name={`addon-${addon.id}`}
                checked={state.checked}
                disabled={state.disabled}
                onChange={(event) => toggleAddon(addon.id, event.target.checked)}
                label={
                  <span>
                    <span className="font-semibold text-white">{addon.name}</span>
                    {price ? <span className="text-slate-300">: {price}</span> : null}
                    <span className="block text-sm text-slate-300">{addon.description}</span>
                    {state.reason ? (
                      <span className="block text-sm text-amber-200">{state.reason}</span>
                    ) : null}
                  </span>
                }
              />
            </div>
          );
        })}
        {errors.addons ? <p className="text-sm text-red-300">{errors.addons}</p> : null}
      </fieldset>
    </div>
  );
}

export function SetupStep({ values, errors, update }: StepProps) {
  return (
    <RadioGroup
      name="setupPreference"
      legend="How do you want it set up?"
      required
      value={values.setupPreference}
      onChange={(value) => update({ setupPreference: value as IntakeValues['setupPreference'] })}
      error={errors.setupPreference}
      options={[
        {
          value: 'done-for-you',
          label: (
            <span>
              <strong className="text-white">Done for you</strong>
              <span className="block text-sm text-slate-300">
                We build, test and launch it. A one-time setup fee applies.
              </span>
            </span>
          ),
        },
        {
          value: 'self-serve-later',
          label: (
            <span>
              <strong className="text-white">I will set it up myself later</strong>
              <span className="block text-sm text-slate-300">
                Self-serve set-up is coming with our customer app. We will contact you when it is
                available.
              </span>
            </span>
          ),
        },
      ]}
    />
  );
}

export function ContactStep({ values, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <FormField label="Your name" required error={errors.contactName}>
        {(control) => (
          <Input
            name="contactName"
            autoComplete="name"
            value={values.contactName}
            onChange={(event) => update({ contactName: event.target.value })}
            {...control}
          />
        )}
      </FormField>
      <FormField label="Email" required error={errors.email}>
        {(control) => (
          <Input
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update({ email: event.target.value })}
            {...control}
          />
        )}
      </FormField>
      <FormField label="Phone" hint="Optional." error={errors.phone}>
        {(control) => (
          <Input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => update({ phone: event.target.value })}
            {...control}
          />
        )}
      </FormField>
      <FormField
        label="Anything else we should know?"
        hint="Optional. For example opening hours, or a coming-soon add-on you would like to register interest in."
        error={errors.notes}
      >
        {(control) => (
          <Textarea
            name="notes"
            rows={5}
            value={values.notes}
            onChange={(event) => update({ notes: event.target.value })}
            {...control}
          />
        )}
      </FormField>
    </div>
  );
}

export interface SummaryRow {
  label: string;
  value: string;
  /** Zero-based step to return to. */
  step: number;
}

interface ReviewStepProps extends Pick<StepProps, 'values' | 'errors' | 'update'> {
  rows: readonly SummaryRow[];
  onEdit: (step: number) => void;
  children?: ReactNode;
}

export function ReviewStep({ values, errors, update, rows, onEdit, children }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <dt className="text-sm font-semibold text-slate-200">{row.label}</dt>
              <dd className="text-slate-300">{row.value}</dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="min-h-11 rounded-lg px-3 text-sm font-semibold text-cyan-300 underline underline-offset-2"
            >
              Edit <span className="sr-only">{row.label}</span>
            </button>
          </div>
        ))}
      </dl>
      <div className="space-y-2">
        <Checkbox
          name="consent"
          checked={values.consent}
          onChange={(event) => update({ consent: event.target.checked })}
          aria-invalid={errors.consent ? true : undefined}
          label={
            <>
              I agree that IK Cloud Solutions may use these details to respond to my enquiry, as
              described in the{' '}
              <Link href={asRoute('/privacy')} className="underline">
                Privacy Policy
              </Link>
              .
            </>
          }
        />
        {errors.consent ? <p className="text-sm text-red-300">{errors.consent}</p> : null}
        <Checkbox
          name="marketingOptIn"
          checked={values.marketingOptIn}
          onChange={(event) => update({ marketingOptIn: event.target.checked })}
          label="Send me occasional news about IK Cloud Solutions services (optional)."
        />
      </div>
      {children}
    </div>
  );
}
