'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Button } from '@/components/ui/Button';
import { publicEnv } from '@/config/env';
import { siteConfig } from '@/config/site';

/** No token within this long of the widget mounting counts as a failed load (amendment A7). */
export const TURNSTILE_LOAD_TIMEOUT_MS = 10_000;
/** onError this many times in a row counts as a failed load. */
const MAX_ERRORS = 2;

export interface TurnstileFieldHandle {
  /** Clears the stored token and resets the widget (tokens are single use). */
  reset: () => void;
}

interface TurnstileFieldProps {
  /** Mount the widget only once the visitor starts the form. */
  active: boolean;
  /** Called with the fresh token, or null whenever it is cleared. */
  onTokenChange: (token: string | null) => void;
  /** Defaults to NEXT_PUBLIC_TURNSTILE_SITE_KEY. Without a key nothing renders. */
  siteKey?: string | undefined;
  ref?: Ref<TurnstileFieldHandle>;
}

/**
 * Cloudflare Turnstile with a fail-closed fallback. If the widget cannot load, submit stays
 * disabled and the visitor gets a mailto route plus a "Try again" button that remounts it.
 */
export function TurnstileField({
  active,
  onTokenChange,
  siteKey = publicEnv.turnstileSiteKey,
  ref,
}: TurnstileFieldProps) {
  const widget = useRef<TurnstileInstance | undefined>(undefined);
  const errors = useRef(0);
  const [attempt, setAttempt] = useState(0);
  const [hasToken, setHasToken] = useState(false);
  const [failed, setFailed] = useState(false);
  const running = active && Boolean(siteKey);

  useImperativeHandle(ref, () => ({
    reset() {
      widget.current?.reset();
      setHasToken(false);
      onTokenChange(null);
    },
  }));

  // 10 s without a token: show the fallback (the timer callback, not the effect, sets state).
  useEffect(() => {
    if (!running || hasToken || failed) return;
    const timer = setTimeout(() => setFailed(true), TURNSTILE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [running, hasToken, failed, attempt]);

  if (!siteKey || !active) return null;

  const retry = () => {
    errors.current = 0;
    setFailed(false);
    setHasToken(false);
    onTokenChange(null);
    setAttempt((value) => value + 1);
  };

  return (
    <div className="space-y-3">
      <Turnstile
        key={attempt}
        ref={widget}
        siteKey={siteKey}
        options={{ theme: 'dark' }}
        onSuccess={(token) => {
          errors.current = 0;
          setFailed(false);
          setHasToken(true);
          onTokenChange(token);
        }}
        onExpire={() => {
          setHasToken(false);
          onTokenChange(null);
          widget.current?.reset();
        }}
        onError={() => {
          setHasToken(false);
          onTokenChange(null);
          errors.current += 1;
          if (errors.current >= MAX_ERRORS) setFailed(true);
          else widget.current?.reset();
        }}
      />
      {failed ? (
        <div role="alert" className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-4">
          <p className="text-sm text-slate-100">
            We could not load the spam check. Please email{' '}
            <a className="underline" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            {siteConfig.phone ? (
              <>
                {' '}
                or call{' '}
                <a className="underline" href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}>
                  {siteConfig.phone}
                </a>
              </>
            ) : null}{' '}
            if you prefer, or try again.
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
