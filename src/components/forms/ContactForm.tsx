'use client';

import { LeadForm } from '@/components/forms/LeadForm';
import { FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { SERVICE_INTERESTS } from '@/lib/validation/lead';

const FIELD_NAMES = ['firstName', 'lastName', 'email', 'subject', 'interest', 'message'] as const;

const LABELS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  subject: 'Subject',
  interest: 'Interest',
  message: 'Message',
};

/** The contact page form (type "contact"). */
export function ContactForm() {
  return (
    <LeadForm
      type="contact"
      fieldNames={FIELD_NAMES}
      labels={LABELS}
      submitLabel="Send message"
      successTitle="Thank you, we have your message"
      successMessage="We reply to enquiries by email."
    >
      {({ errors }) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="First name" required error={errors.firstName}>
              {(control) => <Input name="firstName" autoComplete="given-name" {...control} />}
            </FormField>
            <FormField label="Last name" required error={errors.lastName}>
              {(control) => <Input name="lastName" autoComplete="family-name" {...control} />}
            </FormField>
          </div>
          <FormField label="Email" required error={errors.email}>
            {(control) => <Input name="email" type="email" autoComplete="email" {...control} />}
          </FormField>
          <FormField label="Subject" required error={errors.subject}>
            {(control) => <Input name="subject" {...control} />}
          </FormField>
          <FormField label="What is this about?" required error={errors.interest}>
            {(control) => (
              <Select name="interest" defaultValue="" {...control}>
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
          <FormField label="Message" required error={errors.message}>
            {(control) => <Textarea name="message" rows={6} {...control} />}
          </FormField>
        </>
      )}
    </LeadForm>
  );
}
