import 'server-only';
import { z } from 'zod';

// Server-only environment. Parsed lazily on every call so tests (and a changed deployment)
// never see a stale snapshot. Secrets are never logged or echoed.
const serverEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1).optional(),
  // Comma-separated, each entry a valid email address.
  LEAD_TO_EMAIL: z.string().min(3).optional(),
  // "Name <addr@domain>" or a bare address.
  LEAD_FROM_EMAIL: z.string().min(3).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_BRANCH_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type EnvSource = Record<string, string | undefined>;

/** Empty strings count as unset, which is how .env files and dashboards usually leave them. */
export function parseServerEnv(source: EnvSource = process.env): ServerEnv {
  const cleaned: EnvSource = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value.trim() !== '') cleaned[key] = value.trim();
  }
  const parsed = serverEnvSchema.safeParse(cleaned);
  if (parsed.success) return parsed.data;
  // An unknown NODE_ENV (the only enum) falls back to development rather than crashing a request.
  return serverEnvSchema.parse({ ...cleaned, NODE_ENV: undefined });
}

export function getServerEnv(): ServerEnv {
  return parseServerEnv(process.env);
}

const emailSchema = z.email();

/** Splits LEAD_TO_EMAIL and keeps valid addresses only. */
export function parseRecipients(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => emailSchema.safeParse(entry).success);
}

const FROM_PATTERN = /^(?:[^<>\r\n]+<([^<>\s]+)>|([^<>\s]+))$/;

/** True for "Name <addr@domain>" or a bare address. */
export function isValidFromAddress(value: string | undefined): boolean {
  if (!value || /[\r\n]/.test(value)) return false;
  const match = FROM_PATTERN.exec(value.trim());
  const address = match?.[1] ?? match?.[2];
  return address !== undefined && emailSchema.safeParse(address).success;
}

/**
 * Names of the variables that stop mail from working. Production needs LEAD_TO_EMAIL, a provider
 * key, and LEAD_FROM_EMAIL once a key is set. Development falls back to the console provider and
 * a placeholder recipient, so nothing is required there.
 */
export function mailConfigProblems(env: ServerEnv): string[] {
  const missing: string[] = [];
  if (env.NODE_ENV === 'production') {
    if (!env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
    if (parseRecipients(env.LEAD_TO_EMAIL).length === 0) missing.push('LEAD_TO_EMAIL');
    if (env.RESEND_API_KEY && !isValidFromAddress(env.LEAD_FROM_EMAIL)) {
      missing.push('LEAD_FROM_EMAIL');
    }
  }
  return missing;
}
