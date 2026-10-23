import 'server-only';
import { Resend } from 'resend';
import type { MailProvider, OutboundEmail, SendResult } from '@/lib/server/mail/types';

/** The slice of the Resend SDK this provider uses, so tests can pass a fake. */
export interface ResendClient {
  emails: {
    send(
      payload: {
        from: string;
        to: string[];
        replyTo?: string;
        subject: string;
        html: string;
        text: string;
      },
      options: { idempotencyKey: string; signal: AbortSignal },
    ): Promise<{
      data: { id: string } | null;
      error: { name: string; statusCode: number | null } | null;
    }>;
  };
}

export class ResendProvider implements MailProvider {
  readonly name = 'resend';
  private readonly client: ResendClient;

  // RESEND_BASE_URL (a test seam used by the e2e stub) is read by the SDK itself.
  constructor(apiKey: string, client?: ResendClient) {
    this.client = client ?? (new Resend(apiKey) as unknown as ResendClient);
  }

  async send(message: OutboundEmail, signal: AbortSignal): Promise<SendResult> {
    try {
      const { data, error } = await this.client.emails.send(
        {
          from: message.from,
          to: [...message.to],
          ...(message.replyTo ? { replyTo: message.replyTo } : {}),
          subject: message.subject,
          html: message.html,
          text: message.text,
        },
        { idempotencyKey: message.idempotencyKey, signal },
      );
      if (error) {
        return { ok: false, code: error.name, status: error.statusCode ?? undefined };
      }
      return { ok: true, id: data?.id };
    } catch (error) {
      return { ok: false, code: error instanceof Error ? error.name : 'unknown_error' };
    }
  }
}
