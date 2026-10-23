import {
  MAX_BODY_BYTES,
  generateReference,
  handleLead,
  handleLeadOptions,
} from '@/lib/server/handler';
import { InMemoryRateLimiter } from '@/lib/server/rate-limit';
import { verifyTurnstile } from '@/lib/server/turnstile';
import {
  agentLeadBody,
  consultationBody,
  contactBody,
  errorOf,
  fakeProvider,
  makeHarness,
  post,
} from './helpers';

describe('success path', () => {
  it('answers 200 only after the provider confirms, with a server reference', async () => {
    const h = makeHarness();
    const { response, json } = await post(h, contactBody);
    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true, reference: 'IK-23456789', delivery: 'sent' });
    expect(h.provider.send).toHaveBeenCalledTimes(1);
    const [message] = h.provider.send.mock.calls[0]!;
    expect(message.replyTo).toBe('alex@example.com');
    expect(message.to).toEqual(['owner@example.test']);
    expect(message.from).toBe('IK Leads <leads@example.test>');
    expect(message.subject).toBe('[IK Leads] Contact: Alex Murray');
    expect(h.log).toHaveBeenCalledWith(
      'info',
      'lead.sent',
      expect.objectContaining({ ref: 'IK-23456789', type: 'contact', provider: 'resend' }),
    );
  });

  it('never claims success when the provider fails', async () => {
    const h = makeHarness({ provider: fakeProvider({ ok: false, code: 'application_error' }) });
    const { response, json } = await post(h, contactBody);
    expect(response.status).toBe(502);
    expect(json.ok).toBe(false);
  });

  it('reports delivery "console" for the console provider in development', async () => {
    const provider = fakeProvider({ ok: true, id: 'console' }, 'console');
    const h = makeHarness({ provider }, { NODE_ENV: 'development' });
    const { response, json } = await post(h, consultationBody);
    expect(response.status).toBe(200);
    expect(json.delivery).toBe('console');
    const [message] = provider.send.mock.calls[0]!;
    // Development falls back to placeholder addresses.
    expect(message.to).toEqual(['admin@ikcloudsolutions.com']);
  });

  it('sets Cache-Control: no-store and no CORS headers on every response', async () => {
    const h = makeHarness();
    for (const body of [contactBody, { type: 'nope' }]) {
      const { response } = await post(h, body);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(response.headers.get('access-control-allow-origin')).toBeNull();
    }
  });

  it('skips Turnstile when no secret is set', async () => {
    const h = makeHarness();
    await post(h, contactBody);
    expect(h.deps.verifyTurnstile).not.toHaveBeenCalled();
  });

  it('reuses clientReference as the reference', async () => {
    const h = makeHarness();
    const { json } = await post(h, { ...contactBody, clientReference: 'IK-7F3K9QX2' });
    expect(json.reference).toBe('IK-7F3K9QX2');
  });
});

describe('error table', () => {
  it('403 origin_forbidden for a foreign origin', async () => {
    const h = makeHarness();
    const { response, json } = await post(h, contactBody, {
      headers: { origin: 'https://evil.example' },
    });
    expect(response.status).toBe(403);
    expect(errorOf(json).code).toBe('origin_forbidden');
    expect(h.log).toHaveBeenCalledWith('info', 'lead.origin_rejected', { status: 403 });
    expect(h.provider.send).not.toHaveBeenCalled();
  });

  it('403 when neither Origin nor Sec-Fetch-Site is present in production', async () => {
    const h = makeHarness();
    const { response } = await post(h, contactBody, { headers: { origin: null } });
    expect(response.status).toBe(403);
  });

  it('accepts a missing Origin with Sec-Fetch-Site: same-origin', async () => {
    const h = makeHarness();
    const { response } = await post(h, contactBody, {
      headers: { origin: null, 'sec-fetch-site': 'same-origin' },
    });
    expect(response.status).toBe(200);
  });

  it('415 unsupported_media_type', async () => {
    const h = makeHarness();
    const { response, json } = await post(h, contactBody, {
      headers: { 'content-type': 'text/plain' },
    });
    expect(response.status).toBe(415);
    expect(errorOf(json).code).toBe('unsupported_media_type');
  });

  it('accepts the content type with parameters and in any case (N-6)', async () => {
    const h = makeHarness();
    const { response } = await post(h, contactBody, {
      headers: { 'content-type': 'Application/JSON; charset=utf-8' },
    });
    expect(response.status).toBe(200);
  });

  it('429 rate_limited with Retry-After', async () => {
    const h = makeHarness({ rateLimiter: new InMemoryRateLimiter() });
    const headers = { 'x-forwarded-for': '203.0.113.7' };
    for (let i = 0; i < 5; i += 1) {
      const { response } = await post(h, contactBody, { headers });
      expect(response.status).toBe(200);
    }
    const { response, json } = await post(h, contactBody, { headers });
    expect(response.status).toBe(429);
    expect(errorOf(json).code).toBe('rate_limited');
    expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(errorOf(json).message).toMatch(/try again in \d+ minutes?/);
    expect(h.log).toHaveBeenCalledWith('info', 'lead.rate_limited', { status: 429 });
  });

  it('400 invalid_json for unparseable and non-object bodies', async () => {
    const h = makeHarness();
    for (const raw of ['not json', '[]', 'null', '']) {
      const { response, json } = await post(h, undefined, { raw });
      expect(response.status).toBe(400);
      expect(errorOf(json).code).toBe('invalid_json');
    }
  });

  it('400 rejected for a filled honeypot: honest error, nothing sent', async () => {
    const h = makeHarness();
    const { response, json } = await post(h, { ...contactBody, hp_confirm_ref: 'bot' });
    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(errorOf(json).code).toBe('rejected');
    expect(errorOf(json).message).toBe(
      'We could not accept this submission. Please email admin@ikcloudsolutions.com instead.',
    );
    expect(h.provider.send).not.toHaveBeenCalled();
    expect(h.log).toHaveBeenCalledWith('info', 'lead.spam.honeypot', { status: 400 });
  });

  it('ignores an empty or whitespace honeypot', async () => {
    const h = makeHarness();
    const { response } = await post(h, { ...contactBody, hp_confirm_ref: '   ' });
    expect(response.status).toBe(200);
  });

  it('400 validation_error with per-field messages and no log', async () => {
    const h = makeHarness();
    const { response, json } = await post(h, { ...contactBody, email: 'nope', message: 'short' });
    expect(response.status).toBe(400);
    expect(errorOf(json).code).toBe('validation_error');
    expect(Object.keys(errorOf(json).fields ?? {}).sort()).toEqual(['email', 'message']);
    expect(h.log).not.toHaveBeenCalled();
    expect(h.provider.send).not.toHaveBeenCalled();
  });

  it('400 validation_error for unknown keys', async () => {
    const h = makeHarness();
    const { response, json } = await post(h, { ...contactBody, bcc: 'x@example.com' });
    expect(response.status).toBe(400);
    expect(errorOf(json).fields).toHaveProperty('_form');
  });

  describe('Turnstile', () => {
    const withSecret = { ...{ NODE_ENV: 'production' }, TURNSTILE_SECRET_KEY: 'real-secret' };
    const env = {
      RESEND_API_KEY: 're_test_stub',
      LEAD_TO_EMAIL: 'owner@example.test',
      LEAD_FROM_EMAIL: 'IK Leads <leads@example.test>',
      ...withSecret,
    };

    it('400 captcha_failed', async () => {
      const h = makeHarness(
        { turnstileSiteKey: 'site', verifyTurnstile: async () => 'captcha_failed' },
        env,
      );
      const { response, json } = await post(h, { ...contactBody, turnstileToken: 't' });
      expect(response.status).toBe(400);
      expect(errorOf(json).code).toBe('captcha_failed');
      expect(h.log).toHaveBeenCalledWith('info', 'lead.captcha_failed', {
        type: 'contact',
        status: 400,
      });
    });

    it('503 captcha_unavailable', async () => {
      const h = makeHarness(
        { turnstileSiteKey: 'site', verifyTurnstile: async () => 'captcha_unavailable' },
        env,
      );
      const { response, json } = await post(h, { ...contactBody, turnstileToken: 't' });
      expect(response.status).toBe(503);
      expect(errorOf(json).code).toBe('captcha_unavailable');
      expect(errorOf(json).message).toContain('admin@ikcloudsolutions.com');
      expect(h.log).toHaveBeenCalledWith('warn', 'lead.captcha_unavailable', {
        type: 'contact',
        status: 503,
      });
    });

    it('503 captcha_not_configured when the secret has no public site key', async () => {
      const h = makeHarness({ turnstileSiteKey: undefined }, env);
      const { response, json } = await post(h, { ...contactBody, turnstileToken: 't' });
      expect(response.status).toBe(503);
      expect(errorOf(json).code).toBe('captcha_not_configured');
      expect(h.log).toHaveBeenCalledWith('error', 'lead.misconfigured', {
        status: 503,
        missing: ['NEXT_PUBLIC_TURNSTILE_SITE_KEY'],
      });
      expect(h.provider.send).not.toHaveBeenCalled();
    });

    it('passes the token and client IP to the verifier and sends on success', async () => {
      const verify = vi.fn(async () => 'ok' as const);
      const h = makeHarness({ turnstileSiteKey: 'site', verifyTurnstile: verify }, env);
      const { response } = await post(
        h,
        { ...contactBody, turnstileToken: 'tok' },
        { headers: { 'x-forwarded-for': '198.51.100.9' } },
      );
      expect(response.status).toBe(200);
      expect(verify).toHaveBeenCalledWith({ token: 'tok', ip: '198.51.100.9' });
    });

    it('400 captcha_failed when the token is minted for another hostname (production, real secret)', async () => {
      const fetchImpl = vi.fn(
        async () => new Response(JSON.stringify({ success: true, hostname: 'other.example' })),
      );
      const h = makeHarness(
        {
          tier: 'production',
          turnstileSiteKey: 'site',
          verifyTurnstile: ({ token, ip }) =>
            verifyTurnstile({
              secret: 'real-secret',
              token,
              ip,
              siteUrl: 'https://example.test',
              tier: 'production',
              fetchImpl: fetchImpl as unknown as typeof fetch,
            }),
        },
        env,
      );
      const { response, json } = await post(h, { ...contactBody, turnstileToken: 'tok' });
      expect(response.status).toBe(400);
      expect(errorOf(json).code).toBe('captcha_failed');
    });
  });

  describe('email configuration', () => {
    it('503 email_not_configured in production without a provider, logged once per instance', async () => {
      const h = makeHarness({ provider: null }, { NODE_ENV: 'production' });
      const first = await post(h, contactBody);
      expect(first.response.status).toBe(503);
      expect(errorOf(first.json).code).toBe('email_not_configured');
      expect(h.log).toHaveBeenCalledWith('error', 'lead.email_not_configured', {
        status: 503,
        missing: ['RESEND_API_KEY', 'LEAD_TO_EMAIL'],
      });
      await post(h, contactBody);
      expect(h.log).toHaveBeenCalledTimes(1);
    });

    it('503 when production has a key but no recipient or sender', async () => {
      const h = makeHarness({}, { NODE_ENV: 'production', RESEND_API_KEY: 're_x' });
      const { response } = await post(h, contactBody);
      expect(response.status).toBe(503);
      expect(h.log).toHaveBeenCalledWith('error', 'lead.email_not_configured', {
        status: 503,
        missing: ['LEAD_TO_EMAIL', 'LEAD_FROM_EMAIL'],
      });
      expect(h.provider.send).not.toHaveBeenCalled();
    });
  });

  describe('provider failures', () => {
    it('502 delivery_failed with the reference, logging only name and status', async () => {
      const provider = fakeProvider({ ok: false, code: 'application_error', status: 500 });
      const h = makeHarness({ provider });
      const { response, json } = await post(h, contactBody);
      expect(response.status).toBe(502);
      expect(errorOf(json).code).toBe('delivery_failed');
      expect(errorOf(json).reference).toBe('IK-23456789');
      expect(errorOf(json).message).toContain('admin@ikcloudsolutions.com');
      expect(h.log).toHaveBeenCalledWith('error', 'lead.delivery_failed', {
        ref: 'IK-23456789',
        type: 'contact',
        provider: 'resend',
        code: 'application_error',
        status: 500,
      });
    });

    it('502 delivery_failed when the provider throws', async () => {
      const provider = fakeProvider(async () => {
        throw new TypeError('boom');
      });
      const h = makeHarness({ provider });
      const { response, json } = await post(h, contactBody);
      expect(response.status).toBe(502);
      expect(errorOf(json).code).toBe('delivery_failed');
      expect(h.log).toHaveBeenCalledWith(
        'error',
        'lead.delivery_failed',
        expect.objectContaining({ code: 'TypeError' }),
      );
    });

    it('gives the provider an abort signal with a deadline', async () => {
      const h = makeHarness();
      await post(h, contactBody);
      const [, signal] = h.provider.send.mock.calls[0]!;
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('503 delivery_failed + Retry-After: 5 for concurrent_idempotent_requests', async () => {
      const provider = fakeProvider({
        ok: false,
        code: 'concurrent_idempotent_requests',
        status: 409,
      });
      const h = makeHarness({ provider });
      const { response, json } = await post(h, contactBody);
      expect(response.status).toBe(503);
      expect(response.headers.get('retry-after')).toBe('5');
      expect(errorOf(json).code).toBe('delivery_failed');
      expect(errorOf(json).reference).toBe('IK-23456789');
      expect(h.log).toHaveBeenCalledWith(
        'warn',
        'lead.idempotency_in_flight',
        expect.objectContaining({ status: 503 }),
      );
    });

    it('502 delivery_failed for invalid_idempotent_request, with exactly one send', async () => {
      const provider = fakeProvider({
        ok: false,
        code: 'invalid_idempotent_request',
        status: 409,
      });
      const h = makeHarness({ provider });
      const { response, json } = await post(h, contactBody);
      expect(response.status).toBe(502);
      expect(errorOf(json).code).toBe('delivery_failed');
      expect(provider.send).toHaveBeenCalledTimes(1);
      expect(h.log).toHaveBeenCalledWith(
        'error',
        'lead.idempotency_conflict',
        expect.objectContaining({ status: 502 }),
      );
    });
  });

  it('500 internal_error for an unexpected exception, logging the class name only', async () => {
    const h = makeHarness({
      randomBytes: () => {
        throw new RangeError('entropy unavailable');
      },
    });
    const { response, json } = await post(h, contactBody);
    expect(response.status).toBe(500);
    expect(errorOf(json).code).toBe('internal_error');
    expect(h.log).toHaveBeenCalledWith('error', 'lead.unhandled', {
      status: 500,
      code: 'RangeError',
    });
    expect(JSON.stringify(json)).not.toContain('entropy');
  });
});

describe('body size cap', () => {
  const paddedTo = (bytes: number) => {
    const json = JSON.stringify(contactBody);
    return json + ' '.repeat(bytes - new TextEncoder().encode(json).byteLength);
  };

  it('413 for a lying Content-Length without reading the body', async () => {
    const h = makeHarness();
    const { response, json } = await post(h, contactBody, {
      headers: { 'content-length': String(MAX_BODY_BYTES + 1) },
    });
    expect(response.status).toBe(413);
    expect(errorOf(json).code).toBe('payload_too_large');
  });

  it('413 for a chunked body over the cap with no Content-Length', async () => {
    const h = makeHarness();
    const chunk = new TextEncoder().encode('x'.repeat(10_000));
    let sent = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (sent >= 5) return controller.close();
        sent += 1;
        controller.enqueue(chunk);
      },
    });
    const request = new Request('https://example.test/api/lead', {
      method: 'POST',
      headers: {
        origin: 'https://example.test',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.50',
      },
      body: stream,
      duplex: 'half',
    } as RequestInit);
    const response = await handleLead(request, h.deps);
    expect(response.status).toBe(413);
    // The reader is cancelled as soon as the cap is passed, not after draining the stream.
    expect(sent).toBeLessThan(5);
  });

  it('accepts a body of exactly 32768 bytes', async () => {
    const h = makeHarness();
    const raw = paddedTo(MAX_BODY_BYTES);
    expect(new TextEncoder().encode(raw).byteLength).toBe(MAX_BODY_BYTES);
    const { response } = await post(h, undefined, { raw });
    expect(response.status).toBe(200);
  });

  it('rejects a body one byte over the cap', async () => {
    const h = makeHarness();
    const { response } = await post(h, undefined, { raw: paddedTo(MAX_BODY_BYTES + 1) });
    expect(response.status).toBe(413);
  });
});

describe('idempotency (design 4.8.5)', () => {
  const keyOf = (h: ReturnType<typeof makeHarness>, call = 0) =>
    h.provider.send.mock.calls[call]![0].idempotencyKey;

  it('1. an identical payload twice gives an identical key', async () => {
    const h = makeHarness();
    const body = { ...contactBody, clientReference: 'IK-7F3K9QX2' };
    await post(h, body);
    await post(h, body);
    expect(keyOf(h, 0)).toBe(keyOf(h, 1));
    expect(keyOf(h)).toMatch(/^IK-7F3K9QX2:[0-9a-f]{16}$/);
  });

  it('2. an edited field keeps the reference prefix but changes the hash', async () => {
    const h = makeHarness();
    const body = { ...contactBody, clientReference: 'IK-7F3K9QX2' };
    await post(h, body);
    await post(h, { ...body, message: 'We would like help reviewing our AWS bill instead.' });
    const [prefixA, hashA] = keyOf(h, 0).split(':');
    const [prefixB, hashB] = keyOf(h, 1).split(':');
    expect(prefixA).toBe(prefixB);
    expect(hashA).not.toBe(hashB);
  });

  it('3. invalid_idempotent_request gives 502 and exactly one send', async () => {
    const provider = fakeProvider({ ok: false, code: 'invalid_idempotent_request', status: 409 });
    const h = makeHarness({ provider });
    const { response } = await post(h, contactBody);
    expect(response.status).toBe(502);
    expect(provider.send).toHaveBeenCalledTimes(1);
  });

  it('4. concurrent_idempotent_requests gives 503 with Retry-After', async () => {
    const provider = fakeProvider({
      ok: false,
      code: 'concurrent_idempotent_requests',
      status: 409,
    });
    const h = makeHarness({ provider });
    const { response } = await post(h, contactBody);
    expect(response.status).toBe(503);
    expect(response.headers.get('retry-after')).toBe('5');
  });

  it('5. the body is identical for two different clock values', async () => {
    const early = makeHarness({ now: () => new Date('2026-10-22T09:00:00Z') });
    const late = makeHarness({ now: () => new Date('2026-10-22T21:45:30Z') });
    const body = { ...consultationBody, clientReference: 'IK-7F3K9QX2' };
    await post(early, body);
    await post(late, body);
    const a = early.provider.send.mock.calls[0]![0];
    const b = late.provider.send.mock.calls[0]![0];
    expect(a.html).toBe(b.html);
    expect(a.text).toBe(b.text);
    expect(a.idempotencyKey).toBe(b.idempotencyKey);
  });
});

describe('agent-lead email', () => {
  it('recomputes the estimate on the server and flags the auto-added channel', async () => {
    const h = makeHarness();
    await post(h, agentLeadBody);
    const [message] = h.provider.send.mock.calls[0]!;
    expect(message.subject).toBe('[IK Leads] AI Front Desk enquiry: Meadowbank Dental Practice');
    expect(message.text).toContain('First payment: £517.00 + VAT');
    expect(message.text).toContain('Added automatically: Second channel for Starter');
    expect(message.text).toContain('Indicative only. We confirm a quote before you pay anything.');
    expect(message.text).toContain('Consent (v1): yes');
  });

  it('says "We will recommend a plan" when the plan is not-sure', async () => {
    const h = makeHarness();
    await post(h, { ...agentLeadBody, plan: 'not-sure' });
    const [message] = h.provider.send.mock.calls[0]!;
    expect(message.text).toContain('Plan: We will recommend a plan');
    expect(message.text).toContain('Estimate: We will recommend a plan');
    expect(message.text).not.toContain('First payment');
  });
});

describe('generateReference', () => {
  it('uses the IK- prefix and the unambiguous alphabet', () => {
    expect(generateReference((n) => Uint8Array.from({ length: n }, (_v, i) => i))).toBe(
      'IK-23456789',
    );
    const random = (n: number) => crypto.getRandomValues(new Uint8Array(n));
    for (let i = 0; i < 200; i += 1) {
      expect(generateReference(random)).toMatch(/^IK-[2-9A-HJKMNP-Z]{8}$/);
    }
  });

  it('discards bytes of 248 and above (rejection sampling)', () => {
    // 248..255 are skipped, then 0..7 map to the first eight characters.
    const bytes = [255, 250, 248, 0, 1, 2, 3, 4, 5, 6, 7, 9, 9, 9, 9, 9];
    expect(generateReference(() => Uint8Array.from(bytes))).toBe('IK-23456789');
  });

  it('draws again when a batch is mostly rejected', () => {
    const batches = [
      Uint8Array.from({ length: 16 }, () => 255),
      Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7]),
    ];
    let call = 0;
    expect(generateReference(() => batches[call++]!)).toBe('IK-23456789');
  });
});

describe('OPTIONS', () => {
  it('204 with Allow and no CORS headers', () => {
    const response = handleLeadOptions();
    expect(response.status).toBe(204);
    expect(response.headers.get('allow')).toBe('POST, OPTIONS');
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
