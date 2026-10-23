import { siteConfig } from '@/config/site';

const LEAD_ENDPOINT = '/api/lead';

const GENERIC_FAILURE = `We could not send your message. Please try again, or email ${siteConfig.email}.`;

export type LeadResult =
  | { kind: 'success'; reference: string }
  /** The server rejected specific fields. */
  | { kind: 'validation'; fields: Record<string, string>; reference: string | undefined }
  /** Delivery failed, or the response could not be understood. */
  | { kind: 'failure'; message: string; reference: string | undefined };

interface FailureBody {
  code?: unknown;
  message?: unknown;
  fields?: unknown;
  reference?: unknown;
}

/** Success only when the HTTP status is OK AND the body says ok: true. */
function isSuccess(response: Response, body: unknown): body is { ok: true; reference?: unknown } {
  return (
    response.ok &&
    typeof body === 'object' &&
    body !== null &&
    (body as { ok?: unknown }).ok === true
  );
}

function readError(body: unknown): FailureBody {
  if (typeof body !== 'object' || body === null) return {};
  const error = (body as { error?: unknown }).error;
  return typeof error === 'object' && error !== null ? (error as FailureBody) : {};
}

function readFields(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null) return {};
  const fields: Record<string, string> = {};
  for (const [key, message] of Object.entries(value)) {
    if (typeof message === 'string') fields[key] = message;
  }
  return fields;
}

/**
 * Posts one lead as JSON. An unparseable body or a network error is a delivery failure, never a
 * success. The caller resends `reference` as `clientReference` on retry so the send is idempotent.
 */
export async function postLead(payload: unknown): Promise<LeadResult> {
  let response: Response;
  try {
    response = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Network failure: nothing reached the server.
    return { kind: 'failure', message: GENERIC_FAILURE, reference: undefined };
  }
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // An unparseable body is a delivery failure, handled below.
  }
  if (isSuccess(response, body)) {
    return { kind: 'success', reference: typeof body.reference === 'string' ? body.reference : '' };
  }
  const error = readError(body);
  const reference = typeof error.reference === 'string' ? error.reference : undefined;
  const fields = readFields(error.fields);
  if (error.code === 'validation_error' && Object.keys(fields).length > 0) {
    return { kind: 'validation', fields, reference };
  }
  return {
    kind: 'failure',
    message: typeof error.message === 'string' ? error.message : GENERIC_FAILURE,
    reference,
  };
}
