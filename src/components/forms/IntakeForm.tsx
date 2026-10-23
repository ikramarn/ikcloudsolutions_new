'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { EstimatePanel } from '@/components/forms/intake/EstimatePanel';
import {
  buildPayload,
  effectiveAddons,
  initialValues,
  toEstimateSelection,
  type IntakeValues,
} from '@/components/forms/intake/intake-state';
import {
  BusinessStep,
  CHANNEL_LABELS,
  ChannelStep,
  ContactStep,
  PlanStep,
  ReviewStep,
  SetupStep,
  industryLabel,
  type SummaryRow,
} from '@/components/forms/intake/steps';
import { Honeypot } from '@/components/forms/Honeypot';
import { postLead } from '@/components/forms/lead-submit';
import { TurnstileField, type TurnstileFieldHandle } from '@/components/forms/TurnstileField';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { publicEnv } from '@/config/env';
import { pricingConfig } from '@/config/pricing';
import { siteConfig } from '@/config/site';
import { firstErrorPerField } from '@/lib/validation/common';
import {
  intakeSteps,
  stepIndexForField,
  validateIntakeStep,
  type IntakePrefill,
} from '@/lib/validation/intake';
import { createLeadSchema } from '@/lib/validation/lead';

const LAST_STEP = intakeSteps.length - 1;
const SETUP_STEP = intakeSteps.findIndex((step) => step.id === 'setup');
const ESTIMATE_FROM_STEP = intakeSteps.findIndex((step) => step.id === 'plan');

const FIELD_LABELS: Record<string, string> = {
  businessName: 'Business name',
  websiteUrl: 'Website address',
  industry: 'Industry',
  industryOther: 'Industry',
  channel: 'Channels',
  plan: 'Plan',
  billing: 'Billing',
  addons: 'Add-ons',
  setupPreference: 'Set-up',
  contactName: 'Your name',
  email: 'Email',
  phone: 'Phone',
  notes: 'Notes',
  consent: 'Consent',
};

const ADDON_NAMES: Record<string, string> = Object.fromEntries(
  pricingConfig.addons.map((addon) => [addon.id, addon.name]),
);

type Status = 'editing' | 'submitting' | 'success';

interface IntakeFormProps {
  /** Valid, already-parsed query pre-fill. */
  prefill?: IntakePrefill;
  /** Defaults to NEXT_PUBLIC_TURNSTILE_SITE_KEY. Without one the form is not gated. */
  turnstileSiteKey?: string | undefined;
}

function pickFields(payload: Record<string, unknown>, fields: readonly string[]) {
  return Object.fromEntries(fields.map((field) => [field, payload[field]]));
}

/**
 * The six-step AI Front Desk request. State lives in memory only: nothing is written to browser
 * storage and there are no payment fields. Enter never submits before the last step, each step
 * is validated with the shared schema, and the step heading takes focus on every change.
 */
export function IntakeForm({
  prefill = {},
  turnstileSiteKey = publicEnv.turnstileSiteKey,
}: IntakeFormProps) {
  const [values, setValues] = useState<IntakeValues>(() => initialValues(prefill));
  const [step, setStep] = useState(0);
  const [setupDone, setSetupDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('editing');
  const [reference, setReference] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [headingVersion, setHeadingVersion] = useState(0);
  const [summaryVersion, setSummaryVersion] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const retryReference = useRef<string | null>(null);

  const waitingForToken = Boolean(turnstileSiteKey) && token === null;

  useEffect(() => {
    if (headingVersion > 0) headingRef.current?.focus();
  }, [headingVersion]);

  useEffect(() => {
    if (summaryVersion > 0) summaryRef.current?.focus();
  }, [summaryVersion]);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const update = (patch: Partial<IntakeValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const showErrors = (next: Record<string, string>, nextFailure: string | null = null) => {
    setErrors(next);
    setFailure(nextFailure);
    setSummaryVersion((version) => version + 1);
  };

  const goTo = (index: number) => {
    setStep(index);
    setErrors({});
    setFailure(null);
    setHeadingVersion((version) => version + 1);
  };

  const focusField = (name: string) => {
    const element = formRef.current?.elements.namedItem(name);
    const target = element instanceof RadioNodeList ? element[0] : element;
    if (target instanceof HTMLElement) target.focus();
    else headingRef.current?.focus();
  };

  const handleNext = () => {
    const current = intakeSteps[step];
    if (!current) return;
    const found = validateIntakeStep(current.id, pickFields(buildPayload(values), current.fields));
    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }
    if (step === SETUP_STEP) setSetupDone(true);
    goTo(step + 1);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter before the last step moves on; it never sends the request.
    if (step < LAST_STEP) {
      handleNext();
      return;
    }
    if (status === 'submitting' || waitingForToken) return;

    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = { ...buildPayload(values) };
    const honeypot = form.get('hp_confirm_ref');
    if (typeof honeypot === 'string') payload.hp_confirm_ref = honeypot;
    if (token) payload.turnstileToken = token;
    if (retryReference.current) payload.clientReference = retryReference.current;

    const parsed = createLeadSchema().safeParse(payload);
    if (!parsed.success) {
      const found = firstErrorPerField(parsed.error.issues);
      const earliest = Math.min(...Object.keys(found).map(stepIndexForField));
      if (earliest !== step) {
        setStep(earliest);
        setHeadingVersion((version) => version + 1);
      }
      showErrors(found);
      return;
    }

    setStatus('submitting');
    setErrors({});
    setFailure(null);
    const result = await postLead(payload);
    if (result.kind === 'success') {
      setReference(result.reference);
      setStatus('success');
      return;
    }
    if (result.reference) retryReference.current = result.reference;
    setStatus('editing');
    turnstileRef.current?.reset();
    if (result.kind === 'validation') {
      const earliest = Math.min(...Object.keys(result.fields).map(stepIndexForField));
      setStep(earliest);
      setHeadingVersion((version) => version + 1);
      showErrors(result.fields);
    } else {
      showErrors({}, result.message);
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="space-y-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-6 focus-visible:outline-2"
      >
        <h2 className="text-2xl font-extrabold text-white">Thank you, we have your request</h2>
        {reference ? (
          <p className="text-slate-200">
            Your reference is <strong className="font-mono text-white">{reference}</strong>.
          </p>
        ) : null}
        <p className="text-slate-200">
          We will read it and come back by email with a plan, a quote and a launch timeline. Nothing
          is charged until you have agreed a quote.
        </p>
        <p className="text-slate-200">
          Need to add something? Email{' '}
          <a className="underline" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>{' '}
          and quote your reference.
        </p>
      </div>
    );
  }

  const current = intakeSteps[step];
  const selection = toEstimateSelection(values, setupDone);
  const showEstimate = step >= ESTIMATE_FROM_STEP;
  const submitting = status === 'submitting';
  const errorEntries = Object.entries(errors);

  const addonList = effectiveAddons(values);
  const rows: SummaryRow[] = [
    { label: 'Business', value: values.businessName, step: 0 },
    {
      label: 'Website',
      value: values.hasNoWebsite ? 'No website yet' : values.websiteUrl || 'Not given',
      step: 0,
    },
    {
      label: 'Industry',
      value:
        values.industry === 'other'
          ? values.industryOther
          : values.industry
            ? industryLabel(values.industry)
            : '',
      step: 0,
    },
    {
      label: 'Channels',
      value: values.channel ? CHANNEL_LABELS[values.channel] : '',
      step: 1,
    },
    {
      label: 'Plan',
      value:
        values.plan === 'not-sure'
          ? 'Not sure yet'
          : `${pricingConfig.plans.find((plan) => plan.id === values.plan)?.name ?? ''}, billed ${values.billing}`,
      step: 2,
    },
    {
      label: 'Add-ons',
      value:
        addonList.length > 0 ? addonList.map((id) => ADDON_NAMES[id] ?? id).join(', ') : 'None',
      step: 2,
    },
    {
      label: 'Set-up',
      value:
        values.setupPreference === 'done-for-you'
          ? 'Done for you'
          : 'I will set it up myself later',
      step: 3,
    },
    {
      label: 'Contact',
      value: [values.contactName, values.email, values.phone].filter(Boolean).join(', '),
      step: 4,
    },
  ];

  return (
    <div className="space-y-6">
      <Stepper steps={intakeSteps.map((item) => item.title)} current={step} />
      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        className="relative space-y-6"
        aria-label="Request your AI Front Desk"
      >
        <div ref={summaryRef} tabIndex={-1} role="alert" className="focus-visible:outline-2">
          {failure ? (
            <div className="rounded-lg border border-red-400/40 bg-red-400/10 p-4">
              <p className="text-sm text-slate-100">{failure}</p>
              <p className="mt-2 text-sm text-slate-100">
                You can also email{' '}
                <a className="underline" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
                . Your answers are still in the form.
              </p>
            </div>
          ) : null}
          {errorEntries.length > 0 ? (
            <div className="rounded-lg border border-red-400/40 bg-red-400/10 p-4">
              <p className="text-sm font-semibold text-slate-100">Please check the following:</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-100">
                {errorEntries.map(([name, message]) => (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => focusField(name)}
                      className="text-left underline underline-offset-2"
                    >
                      {FIELD_LABELS[name] ? `${FIELD_LABELS[name]}: ` : ''}
                      {message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className={showEstimate ? 'space-y-6 lg:col-span-2' : 'space-y-6 lg:col-span-3'}>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-extrabold text-white focus-visible:outline-2"
            >
              {current?.title}
            </h2>
            {step === 0 ? <BusinessStep values={values} errors={errors} update={update} /> : null}
            {step === 1 ? <ChannelStep values={values} errors={errors} update={update} /> : null}
            {step === 2 ? <PlanStep values={values} errors={errors} update={update} /> : null}
            {step === 3 ? <SetupStep values={values} errors={errors} update={update} /> : null}
            {step === 4 ? <ContactStep values={values} errors={errors} update={update} /> : null}
            {step === LAST_STEP ? (
              <ReviewStep values={values} errors={errors} update={update} rows={rows} onEdit={goTo}>
                <Honeypot />
                <TurnstileField
                  ref={turnstileRef}
                  active
                  siteKey={turnstileSiteKey}
                  onTokenChange={setToken}
                />
              </ReviewStep>
            ) : null}
          </div>
          {showEstimate ? (
            <div className="space-y-3 lg:col-span-1">
              <EstimatePanel selection={selection} addonNames={ADDON_NAMES} />
              {!setupDone ? (
                <p className="text-sm text-slate-300">
                  The setup fee is added once you have chosen how you want it set up.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {step > 0 ? (
            <Button variant="secondary" onClick={() => goTo(step - 1)}>
              Back
            </Button>
          ) : null}
          {step < LAST_STEP ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button type="submit" loading={submitting} aria-disabled={waitingForToken || undefined}>
              {submitting
                ? 'Sending...'
                : waitingForToken
                  ? 'Checking you are human...'
                  : 'Send my request'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
