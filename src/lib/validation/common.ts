import { z } from 'zod';

// Shared by the browser (UX) and the server (authority). Never import server-only code here.

/** Unambiguous alphabet for lead references (no 0/1/I/L/O). 31 characters. */
export const REFERENCE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const REFERENCE_PATTERN = /^IK-[2-9A-HJKMNP-Z]{8}$/;

// Control characters other than tab (0x09), line feed (0x0A) and carriage return (0x0D).
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** One line: CR/LF/tab become a space, control characters go, whitespace collapses. */
export function cleanSingleLine(value: string): string {
  return value
    .normalize('NFC')
    .replace(CONTROL, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/** Several lines: line endings become \n, control characters go. */
function cleanMultiline(value: string): string {
  return value
    .normalize('NFC')
    .replace(CONTROL, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function lengthMessage(label: string, min: number, max: number): [string, string] {
  return [
    min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`,
    `${label} must be ${max} characters or fewer`,
  ];
}

/** Required single-line text. */
export function requiredText(label: string, min: number, max: number) {
  const [minMessage, maxMessage] = lengthMessage(label, min, max);
  return z
    .string({ error: `${label} is required` })
    .transform(cleanSingleLine)
    .pipe(z.string().min(min, minMessage).max(max, maxMessage));
}

/** Optional single-line text. An empty string becomes undefined. */
export function optionalText(label: string, max: number) {
  return z
    .string()
    .transform(cleanSingleLine)
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer`))
    .transform((value) => (value === '' ? undefined : value))
    .optional();
}

/** Multiline text. */
export function multilineText(label: string, min: number, max: number) {
  const [minMessage, maxMessage] = lengthMessage(label, min, max);
  return z
    .string({ error: `${label} is required` })
    .transform(cleanMultiline)
    .pipe(z.string().min(min, minMessage).max(max, maxMessage));
}

export function optionalMultiline(label: string, max: number) {
  return z
    .string()
    .transform(cleanMultiline)
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer`))
    .transform((value) => (value === '' ? undefined : value))
    .optional();
}

const EMAIL_MESSAGE = 'Enter a valid email address';

/** The CR/LF check runs on the RAW value, before trimming, so injected line breaks never pass. */
export const emailField = z
  .string({ error: EMAIL_MESSAGE })
  .refine((value) => !/[\r\n]/.test(value), EMAIL_MESSAGE)
  .transform((value) => value.normalize('NFC').trim().toLowerCase())
  .pipe(z.email(EMAIL_MESSAGE).max(254, EMAIL_MESSAGE));

const PHONE_MESSAGE = 'Enter a phone number of 7 to 20 digits, spaces, + ( ) or -';

export const phoneField = z
  .string()
  .transform(cleanSingleLine)
  .refine(
    (value) =>
      value === '' || (value.length >= 7 && value.length <= 20 && /^[+0-9 ()-]+$/.test(value)),
    PHONE_MESSAGE,
  )
  .transform((value) => (value === '' ? undefined : value))
  .optional();
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:(?!\d)/i;

/** "example.com" -> "https://example.com". Other schemes are left alone so they are rejected. */
function normaliseUrl(raw: string): string {
  const value = raw.trim();
  if (value === '') return value;
  return HAS_SCHEME.test(value) ? value : `https://${value}`;
}

const URL_MESSAGE = 'Enter a web address such as example.com';

function isAcceptableUrl(value: string): boolean {
  if (value === '') return true;
  if (value.length > 2048 || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}

/** Optional http(s) URL with a dotted hostname. An empty string becomes undefined. */
export const optionalUrl = z
  .string()
  .transform(normaliseUrl)
  .refine(isAcceptableUrl, URL_MESSAGE)
  .transform((value) => (value === '' ? undefined : value))
  .optional();
export const honeypotField = z.string().max(500).optional();
export const turnstileTokenField = z.string().max(2048).optional();
export const clientReferenceField = z
  .string()
  .regex(REFERENCE_PATTERN, 'Invalid reference')
  .optional();
export const marketingOptInField = z.boolean().default(false);

/** Reduces zod issues to the first message per field. Form-level issues use "_form". */
export function firstErrorPerField(issues: readonly z.core.$ZodIssue[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join('.') : '_form';
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}
