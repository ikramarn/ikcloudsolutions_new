import 'server-only';
import { ConsoleProvider } from '@/lib/server/mail/console';
import { ResendProvider } from '@/lib/server/mail/resend';
import type { MailProvider } from '@/lib/server/mail/types';

export interface MailProviderEnv {
  RESEND_API_KEY?: string | undefined;
  NODE_ENV?: string | undefined;
  VERCEL?: string | undefined;
}

/**
 * Resend when a key is set. The console provider only for development or test, and never when
 * NODE_ENV is production or VERCEL is set. Null means "not configured": the handler answers 503.
 */
export function getMailProvider(env: MailProviderEnv): MailProvider | null {
  if (env.RESEND_API_KEY) return new ResendProvider(env.RESEND_API_KEY);
  const local = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
  if (local && !env.VERCEL) return new ConsoleProvider();
  return null;
}
