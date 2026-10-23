import 'server-only';
import type { MailProvider, OutboundEmail, SendResult } from '@/lib/server/mail/types';

/**
 * Local development only. It prints personal data, so getMailProvider never selects it when
 * NODE_ENV is production or VERCEL is set.
 */
export class ConsoleProvider implements MailProvider {
  readonly name = 'console';

  async send(message: OutboundEmail): Promise<SendResult> {
    // eslint-disable-next-line no-console -- development-only provider whose job is to print
    console.info(
      [
        '--- lead email (console provider, development only) ---',
        `From: ${message.from}`,
        `To: ${message.to.join(', ')}`,
        `Reply-To: ${message.replyTo ?? '(none)'}`,
        `Subject: ${message.subject}`,
        message.text,
        '--- end ---',
      ].join('\n'),
    );
    return { ok: true, id: 'console' };
  }
}
