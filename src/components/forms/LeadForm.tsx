'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Honeypot } from '@/components/forms/Honeypot';
import { postLead } from '@/components/forms/lead-submit';
import { TurnstileField, type TurnstileFieldHandle } from '@/components/forms/TurnstileField';
import { Button } from '@/components/ui/Button';
import { publicEnv } from '@/config/env';
import { asRoute } from '@/config/links';
import { siteConfig } from '@/config/site';
import { firstErrorPerField } from '@/lib/validation/common';
import { createLeadSchema, type LeadType } from '@/lib/validation/lead';

type Status = 'idle' | 'submitting' | 'success';

/** Text controls and selects by name; checkboxes become booleans. */
function readFormValues(form: HTMLFormElement, names: readonly string[]): Record<string, unknown> {
  const data = new FormData(form);
  const values: Record<string, unknown> = {};
  for (const name of names) {
    const value = data.get(name);
    if (typeof value === 'string') values[name] = value;
  }
  return values;
}

export interface LeadFormRenderContext {
  /** Field-level error by field name, from the shared schema or the server. */
  errors: Record<string, string>;
}

interface LeadFormProps {
  type: Exclude<LeadType, 'agent-lead'>;
  /** Names of the controls to send, in addition to type, honeypot and token. */
  fieldNames: readonly string[];
  /** Field labels for the error summary. */
  labels: Record<string, string>;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  /** Called after the server confirms delivery. */
  onSuccess?: (reference: string) => void;
  /** Defaults to NEXT_PUBLIC_TURNSTILE_SITE_KEY. Without one the form is not gated. */
  turnstileSiteKey?: string | undefined;
  className?: string;
  children: (context: LeadFormRenderContext) => ReactNode;
}

/**
 * Shared submit logic for the contact and consultation forms. Values are never cleared on
 * failure, the error summary takes focus, a delivery failure always offers the mailto fallback,
 * and the server's `error.reference` is resent as `clientReference` so a retry is idempotent.
 */
export function LeadForm({
  type,
  fieldNames,
  labels,
  submitLabel,
  successTitle,
  successMessage,
  onSuccess,
  turnstileSiteKey = publicEnv.turnstileSiteKey,
  className,
  children,
}: LeadFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<{ message: string; mailto: boolean } | null>(null);
  const [errorVersion, setErrorVersion] = useState(0);
  const [reference, setReference] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const retryReference = useRef<string | null>(null);

  const captchaRequired = Boolean(turnstileSiteKey);
  const waitingForToken = captchaRequired && token === null;

  useEffect(() => {
    if (errorVersion > 0) summaryRef.current?.focus();
  }, [errorVersion]);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const showErrors = (nextErrors: Record<string, string>, nextFailure: typeof failure) => {
    setErrors(nextErrors);
    setFailure(nextFailure);
    setErrorVersion((version) => version + 1);
  };

  // Tokens are single use: after any non-2xx the widget is reset and the token cleared.
  const resetCaptcha = () => turnstileRef.current?.reset();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting' || waitingForToken) return;

    const payload: Record<string, unknown> = {
      type,
      ...readFormValues(event.currentTarget, [...fieldNames, 'hp_confirm_ref']),
    };
    if (token) payload.turnstileToken = token;
    if (retryReference.current) payload.clientReference = retryReference.current;

    const parsed = createLeadSchema().safeParse(payload);
    if (!parsed.success) {
      showErrors(firstErrorPerField(parsed.error.issues), null);
      return;
    }

    setStatus('submitting');
    setErrors({});
    setFailure(null);

    const result = await postLead(payload);
    if (result.kind === 'success') {
      setReference(result.reference);
      setStatus('success');
      onSuccess?.(result.reference);
      return;
    }
    if (result.reference) retryReference.current = result.reference;
    setStatus('idle');
    resetCaptcha();
    if (result.kind === 'validation') showErrors(result.fields, null);
    else showErrors({}, { message: result.message, mailto: true });
  }
  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-6 focus-visible:outline-2"
      >
        <h3 className="text-lg font-extrabold text-white">{successTitle}</h3>
        <p className="mt-2 text-slate-200">{successMessage}</p>
        {reference ? (
          <p className="mt-2 text-slate-200">
            Your reference is <strong className="font-mono text-white">{reference}</strong>.
          </p>
        ) : null}
      </div>
    );
  }

  const errorEntries = Object.entries(errors);
  const submitting = status === 'submitting';

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      onFocusCapture={() => setStarted(true)}
      className={`relative space-y-5 ${className ?? ''}`.trim()}
    >
      <div ref={summaryRef} tabIndex={-1} role="alert" className="focus-visible:outline-2">
        {failure ? (
          <div className="rounded-lg border border-red-400/40 bg-red-400/10 p-4">
            <p className="text-sm text-slate-100">{failure.message}</p>
            {failure.mailto ? (
              <p className="mt-2 text-sm text-slate-100">
                You can also email{' '}
                <a className="underline" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
                . Your answers are still in the form.
              </p>
            ) : null}
          </div>
        ) : null}
        {errorEntries.length > 0 ? (
          <div className="rounded-lg border border-red-400/40 bg-red-400/10 p-4">
            <p className="text-sm font-semibold text-slate-100">Please check the following:</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-100">
              {errorEntries.map(([name, message]) => (
                <li key={name}>
                  {labels[name] ? `${labels[name]}: ` : ''}
                  {message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {children({ errors })}

      <Honeypot />

      <TurnstileField
        ref={turnstileRef}
        active={started}
        siteKey={turnstileSiteKey}
        onTokenChange={setToken}
      />

      <p className="text-sm text-slate-300">
        We use your details only to reply to your enquiry. See our{' '}
        <Link className="underline" href={asRoute('/privacy')}>
          privacy policy
        </Link>
        .
      </p>

      <Button
        type="submit"
        loading={submitting}
        aria-disabled={waitingForToken || undefined}
        className="w-full sm:w-auto"
      >
        {submitting ? 'Sending...' : waitingForToken ? 'Checking you are human...' : submitLabel}
      </Button>
    </form>
  );
}
