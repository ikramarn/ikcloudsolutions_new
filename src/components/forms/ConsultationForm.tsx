'use client';

import { useSyncExternalStore } from 'react';
import { LeadForm } from '@/components/forms/LeadForm';
import { FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { addDaysIso, londonDate } from '@/lib/dates';
import {
  CLOUD_PROVIDERS,
  MONTHLY_SPEND_BANDS,
  SERVICE_INTERESTS,
  TIME_WINDOWS,
  type ServiceInterest,
} from '@/lib/validation/lead';

const FIELD_NAMES = [
  'name',
  'email',
  'phone',
  'company',
  'roleTitle',
  'focus',
  'cloudProvider',
  'monthlySpend',
  'preferredDate',
  'preferredTimeWindow',
  'notes',
] as const;

const LABELS: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  roleTitle: 'Role',
  focus: 'What do you need help with?',
  cloudProvider: 'Main cloud provider',
  monthlySpend: 'Monthly cloud spend',
  preferredDate: 'Preferred date',
  preferredTimeWindow: 'Preferred time',
  notes: 'Notes',
};

const TIME_LABELS: Record<(typeof TIME_WINDOWS)[number], string> = {
  morning: 'Morning (UK time)',
  afternoon: 'Afternoon (UK time)',
  evening: 'Evening (UK time)',
};

const subscribeNever = () => () => undefined;
// The date window is computed on the client from the London calendar date. The server snapshot
// is undefined, so nothing date-dependent is in the server HTML and there is no hard-coded date.
const today = () => londonDate(new Date());
const unknownOnServer = () => undefined;

export interface ConsultationPreset {
  focus?: ServiceInterest;
}

interface ConsultationFormProps {
  preset?: ConsultationPreset | undefined;
  /** Defaults to NEXT_PUBLIC_TURNSTILE_SITE_KEY. */
  turnstileSiteKey?: string | undefined;
}

/**
 * The consultation request form (type "consultation"). It is its own component, mounted by the
 * dialog's content, so every hook runs unconditionally and all state resets when it closes.
 */
export function ConsultationForm({ preset, turnstileSiteKey }: ConsultationFormProps) {
  const min = useSyncExternalStore(subscribeNever, today, unknownOnServer);
  const max = min ? addDaysIso(min, 90) : undefined;

  return (
    <LeadForm
      type="consultation"
      fieldNames={FIELD_NAMES}
      labels={LABELS}
      submitLabel="Request a consultation"
      successTitle="Thank you, we have your request"
      successMessage="We reply to enquiries by email to arrange a time."
      turnstileSiteKey={turnstileSiteKey}
    >
      {({ errors }) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Name" required error={errors.name}>
              {(control) => <Input name="name" autoComplete="name" {...control} />}
            </FormField>
            <FormField label="Email" required error={errors.email}>
              {(control) => <Input name="email" type="email" autoComplete="email" {...control} />}
            </FormField>
            <FormField label="Phone" error={errors.phone}>
              {(control) => <Input name="phone" type="tel" autoComplete="tel" {...control} />}
            </FormField>
            <FormField label="Company" error={errors.company}>
              {(control) => <Input name="company" autoComplete="organization" {...control} />}
            </FormField>
            <FormField label="Role" error={errors.roleTitle} className="sm:col-span-2">
              {(control) => (
                <Input name="roleTitle" autoComplete="organization-title" {...control} />
              )}
            </FormField>
          </div>
          <FormField label="What do you need help with?" required error={errors.focus}>
            {(control) => (
              <Select name="focus" defaultValue={preset?.focus ?? ''} {...control}>
                <option value="" disabled>
                  Choose an option
                </option>
                {SERVICE_INTERESTS.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Main cloud provider" required error={errors.cloudProvider}>
              {(control) => (
                <Select name="cloudProvider" defaultValue="" {...control}>
                  <option value="" disabled>
                    Choose an option
                  </option>
                  {CLOUD_PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Monthly cloud spend" required error={errors.monthlySpend}>
              {(control) => (
                <Select name="monthlySpend" defaultValue="" {...control}>
                  <option value="" disabled>
                    Choose an option
                  </option>
                  {MONTHLY_SPEND_BANDS.map((band) => (
                    <option key={band} value={band}>
                      {band}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Preferred date" error={errors.preferredDate}>
              {(control) => (
                <Input name="preferredDate" type="date" min={min} max={max} {...control} />
              )}
            </FormField>
            <FormField label="Preferred time" required error={errors.preferredTimeWindow}>
              {(control) => (
                <Select name="preferredTimeWindow" defaultValue="" {...control}>
                  <option value="" disabled>
                    Choose an option
                  </option>
                  {TIME_WINDOWS.map((window) => (
                    <option key={window} value={window}>
                      {TIME_LABELS[window]}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>
          <FormField label="Anything else we should know?" error={errors.notes}>
            {(control) => <Textarea name="notes" rows={4} {...control} />}
          </FormField>
        </>
      )}
    </LeadForm>
  );
}
