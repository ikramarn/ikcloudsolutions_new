import 'server-only';

export interface OutboundEmail {
  readonly from: string;
  readonly to: readonly string[];
  readonly replyTo?: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  /** `${reference}:${contentHash16}`, passed to the provider as its idempotency key. */
  readonly idempotencyKey: string;
}

export type SendResult =
  | { readonly ok: true; readonly id?: string | undefined }
  | { readonly ok: false; readonly code: string; readonly status?: number | undefined };

export interface MailProvider {
  readonly name: 'resend' | 'console';
  send(message: OutboundEmail, signal: AbortSignal): Promise<SendResult>;
}
