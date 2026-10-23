import 'server-only';
import type { LeadType } from '@/lib/validation/lead';

export type LogLevel = 'info' | 'warn' | 'error';

/**
 * The only fields that can be logged. Names, emails, phones, free text, IP addresses and tokens
 * have no field here, so passing them is a type error.
 */
export interface LogFields {
  ref?: string;
  type?: LeadType;
  status?: number;
  code?: string;
  provider?: string;
  durationMs?: number;
  missing?: string[];
}

export type LogFn = (level: LogLevel, event: string, fields?: LogFields) => void;

/** One JSON line to stdout (Vercel runtime logs). No file writes anywhere. */
export const logEvent: LogFn = (level, event, fields = {}) => {
  process.stdout.write(`${JSON.stringify({ level, event, ...fields })}\n`);
};
