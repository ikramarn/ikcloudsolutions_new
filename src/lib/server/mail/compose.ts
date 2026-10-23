import 'server-only';
import { createHash } from 'node:crypto';
import type { OutboundEmail } from '@/lib/server/mail/types';
import type { Lead } from '@/lib/validation/lead';

/** What the owner sees as the lead's name, by lead type. */
export function leadDisplayName(lead: Lead): string {
  if (lead.type === 'contact') return `${lead.firstName} ${lead.lastName}`;
  if (lead.type === 'consultation') return lead.name;
  return lead.contactName;
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Binds the reference to the exact message content: an identical retry reuses the key (Resend
 * returns the original result), an edited retry gets a new key. No timestamp is in the body, so
 * identical retries are byte-identical. The result is well inside Resend's 256-character limit.
 */
export function buildIdempotencyKey(
  reference: string,
  email: Pick<OutboundEmail, 'subject' | 'text' | 'html'>,
): string {
  const hash = sha256Hex(`${email.subject}\n${email.text}\n${email.html}`).slice(0, 16);
  return `${reference}:${hash}`;
}
