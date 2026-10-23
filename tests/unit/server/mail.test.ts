import { pricingConfig } from '@/config/pricing';
import { ConsoleProvider } from '@/lib/server/mail/console';
import { buildIdempotencyKey, leadDisplayName, sha256Hex } from '@/lib/server/mail/compose';
import { getMailProvider } from '@/lib/server/mail';
import { ResendProvider, type ResendClient } from '@/lib/server/mail/resend';
import type { OutboundEmail } from '@/lib/server/mail/types';
import { buildLeadEmail, buildSubject } from '@/lib/server/lead-email';
import { escapeHtml, stripCrlf } from '@/lib/server/sanitize';
import { createLeadSchema, type Lead } from '@/lib/validation/lead';
import { agentLeadBody, consultationBody, contactBody } from './helpers';

const schema = createLeadSchema(() => new Date('2026-10-22T12:00:00Z'));
const parse = (input: unknown): Lead => schema.parse(input);

const message: OutboundEmail = {
  from: 'IK Leads <leads@example.test>',
  to: ['owner@example.test'],
  replyTo: 'alex@example.com',
  subject: 'Subject',
  html: '<p>hi</p>',
  text: 'hi',
  idempotencyKey: 'IK-23456789:abcdef0123456789',
};

describe('getMailProvider', () => {
  it('uses Resend whenever a key is set', () => {
    expect(getMailProvider({ RESEND_API_KEY: 're_x', NODE_ENV: 'production' })?.name).toBe(
      'resend',
    );
    expect(getMailProvider({ RESEND_API_KEY: 're_x', NODE_ENV: 'development' })?.name).toBe(
      'resend',
    );
  });

  it('uses the console provider only for development or test', () => {
    expect(getMailProvider({ NODE_ENV: 'development' })?.name).toBe('console');
    expect(getMailProvider({ NODE_ENV: 'test' })?.name).toBe('console');
  });

  it('refuses the console provider in production', () => {
    expect(getMailProvider({ NODE_ENV: 'production' })).toBeNull();
    expect(getMailProvider({})).toBeNull();
  });

  it('refuses the console provider when VERCEL is set, even in development', () => {
    expect(getMailProvider({ NODE_ENV: 'development', VERCEL: '1' })).toBeNull();
    expect(getMailProvider({ NODE_ENV: 'test', VERCEL: '1' })).toBeNull();
  });
});

describe('ConsoleProvider', () => {
  it('prints the message and reports success', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const result = await new ConsoleProvider().send(message);
    expect(result).toEqual({ ok: true, id: 'console' });
    expect(info).toHaveBeenCalledWith(expect.stringContaining('Subject: Subject'));
    info.mockRestore();
  });
});

describe('ResendProvider', () => {
  const signal = new AbortController().signal;

  function client(response: unknown): { client: ResendClient; send: ReturnType<typeof vi.fn> } {
    const send = vi.fn(async () => response);
    return { client: { emails: { send } } as unknown as ResendClient, send };
  }

  it('sends structured fields with the idempotency key and signal', async () => {
    const { client: fake, send } = client({ data: { id: 'abc' }, error: null });
    const result = await new ResendProvider('re_x', fake).send(message, signal);
    expect(result).toEqual({ ok: true, id: 'abc' });
    expect(send).toHaveBeenCalledWith(
      {
        from: message.from,
        to: ['owner@example.test'],
        replyTo: 'alex@example.com',
        subject: 'Subject',
        html: '<p>hi</p>',
        text: 'hi',
      },
      { idempotencyKey: message.idempotencyKey, signal },
    );
  });

  it('maps an SDK error to its name and status', async () => {
    const { client: fake } = client({
      data: null,
      error: { name: 'concurrent_idempotent_requests', statusCode: 409, message: 'x' },
    });
    await expect(new ResendProvider('re_x', fake).send(message, signal)).resolves.toEqual({
      ok: false,
      code: 'concurrent_idempotent_requests',
      status: 409,
    });
  });

  it('maps a null status code to undefined', async () => {
    const { client: fake } = client({
      data: null,
      error: { name: 'application_error', statusCode: null },
    });
    const result = await new ResendProvider('re_x', fake).send(message, signal);
    expect(result).toEqual({ ok: false, code: 'application_error', status: undefined });
  });

  it('maps thrown exceptions, including a timeout', async () => {
    const send = vi.fn(async () => {
      throw new DOMException('timed out', 'TimeoutError');
    });
    const result = await new ResendProvider('re_x', {
      emails: { send },
    } as unknown as ResendClient).send(message, signal);
    expect(result).toEqual({ ok: false, code: 'TimeoutError' });
  });

  it('omits replyTo when there is none', async () => {
    const { client: fake, send } = client({ data: { id: 'abc' }, error: null });
    const { replyTo: _omit, ...withoutReplyTo } = message;
    await new ResendProvider('re_x', fake).send(withoutReplyTo, signal);
    expect(send.mock.calls[0]![0]).not.toHaveProperty('replyTo');
  });
});

describe('compose', () => {
  it('names the lead by type', () => {
    expect(leadDisplayName(parse(contactBody))).toBe('Alex Murray');
    expect(leadDisplayName(parse(consultationBody))).toBe('Alex Murray');
    expect(leadDisplayName(parse(agentLeadBody))).toBe('Alex Murray');
    expect(leadDisplayName(parse({ ...contactBody, firstName: 'Sam', lastName: 'Lee' }))).toBe(
      'Sam Lee',
    );
  });

  it('builds `${reference}:${hash16}` from subject, text and html', () => {
    const key = buildIdempotencyKey('IK-23456789', message);
    expect(key).toBe(
      `IK-23456789:${sha256Hex(`${message.subject}\n${message.text}\n${message.html}`).slice(0, 16)}`,
    );
    expect(key).toHaveLength('IK-23456789:'.length + 16);
    expect(buildIdempotencyKey('IK-23456789', { ...message, text: 'changed' })).not.toBe(key);
    expect(buildIdempotencyKey('IK-23456789', { ...message, html: '<p>x</p>' })).not.toBe(key);
    expect(buildIdempotencyKey('IK-23456789', { ...message, subject: 'Other' })).not.toBe(key);
  });
});

describe('sanitize', () => {
  it('escapes the five HTML metacharacters', () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;',
    );
    expect(escapeHtml('plain text')).toBe('plain text');
  });

  it('turns CR and LF into a space', () => {
    expect(stripCrlf('a\r\nBcc: x@example.com\nb')).toBe('a Bcc: x@example.com b');
  });
});

describe('lead email', () => {
  const context = { reference: 'IK-23456789', from: message.from, to: message.to };

  it('escapes hostile input in the HTML body and keeps the text part raw', () => {
    const lead = parse({
      ...contactBody,
      firstName: '<img src=x onerror=alert(1)>',
      subject: 'Hello <b>there</b>',
      message: 'Line one <script>alert("x")</script>\nLine two & more',
    });
    const email = buildLeadEmail(lead, context);
    expect(email.html).not.toContain('<img');
    expect(email.html).not.toContain('<script');
    expect(email.html).not.toContain('<b>there');
    expect(email.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(email.html).toContain(
      'Line one &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;<br>Line two &amp; more',
    );
    expect(email.text).toContain('<script>alert("x")</script>');
  });

  it('keeps header-bound values free of CR and LF', () => {
    const lead = parse({
      ...agentLeadBody,
      businessName: 'Acme\r\nBcc: attacker@example.com',
    });
    const email = buildLeadEmail(lead, context);
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.subject).toBe('[IK Leads] AI Front Desk enquiry: Acme Bcc: attacker@example.com');
    expect(email.replyTo).not.toMatch(/[\r\n]/);
  });

  it('builds the three subject formats', () => {
    expect(buildSubject(parse(contactBody))).toBe('[IK Leads] Contact: Alex Murray');
    expect(buildSubject(parse(consultationBody))).toBe(
      '[IK Leads] Consultation request: Alex Murray',
    );
    expect(buildSubject(parse(agentLeadBody))).toBe(
      '[IK Leads] AI Front Desk enquiry: Meadowbank Dental Practice',
    );
    const long = parse({ ...agentLeadBody, businessName: 'B'.repeat(100) });
    expect(buildSubject(long)).toBe(`[IK Leads] AI Front Desk enquiry: ${'B'.repeat(60)}`);
  });

  it('records the reference, source, consent version and marketing choice, with no timestamp', () => {
    const email = buildLeadEmail(parse({ ...contactBody, marketingOptIn: true }), context);
    expect(email.text).toContain('Reference: IK-23456789');
    expect(email.text).toContain('Source: Contact form');
    expect(email.text).toContain('Consent (v1): no');
    expect(email.text).toContain('Marketing opt-in: yes');
    expect(email.text).not.toMatch(/\d{4}-\d{2}-\d{2}T|\b\d{2}:\d{2}:\d{2}\b/);
    expect(email.replyTo).toBe('alex@example.com');
  });

  it('shows the net figure next to the presented figure when VAT is included', () => {
    const lead = parse({ ...agentLeadBody, channel: 'voice', setupPreference: 'self-serve-later' });
    const pricing = { ...pricingConfig, vat: { mode: 'inclusive' as const, ratePercent: 20 } };
    const email = buildLeadEmail(lead, { ...context, pricing });
    expect(email.text).toContain('Plan billed now: £94.80 inc. VAT (net £79.00)');
  });

  it('is byte-identical for identical input', () => {
    const lead = parse(agentLeadBody);
    expect(buildLeadEmail(lead, context)).toEqual(buildLeadEmail(lead, context));
  });
});
