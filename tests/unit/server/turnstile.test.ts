import {
  CLOUDFLARE_TEST_SECRET,
  shouldEnforceHostname,
  verifyTurnstile,
  type VerifyTurnstileInput,
} from '@/lib/server/turnstile';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TEST_SECRET = '1x0000000000000000000000000000000AA';

describe('shouldEnforceHostname truth table', () => {
  it.each([
    ['production', 'real-secret', true],
    ['production', TEST_SECRET, false],
    ['production', '2x0000000000000000000000000000000AA', false],
    ['production', '3x0000000000000000000000000000000AA', false],
    ['preview', 'real-secret', false],
    ['preview', TEST_SECRET, false],
    ['local', 'real-secret', false],
    ['local', TEST_SECRET, false],
  ] as const)('tier %s with secret %s -> %s', (tier, secret, expected) => {
    expect(shouldEnforceHostname(tier, secret)).toBe(expected);
  });

  it('recognises only the dummy secret shape', () => {
    expect(CLOUDFLARE_TEST_SECRET.test('1x00000000')).toBe(false);
    expect(CLOUDFLARE_TEST_SECRET.test('1x0000000000')).toBe(true);
    expect(CLOUDFLARE_TEST_SECRET.test('0x4AAAAAAAreal')).toBe(false);
  });
});

function verify(
  response: () => Promise<Response> | Response,
  over: Partial<VerifyTurnstileInput> = {},
) {
  const fetchImpl = vi.fn(async () => response());
  const result = verifyTurnstile({
    secret: 'real-secret',
    token: 'token-123',
    ip: '203.0.113.7',
    siteUrl: 'https://ikcloudsolutions.com',
    tier: 'local',
    fetchImpl: fetchImpl as unknown as typeof fetch,
    ...over,
  });
  return { result, fetchImpl };
}

const ok = (body: unknown) => () => new Response(JSON.stringify(body), { status: 200 });

describe('verifyTurnstile (mocked fetch)', () => {
  it('returns ok on success and posts a form-encoded body', async () => {
    const { result, fetchImpl } = verify(ok({ success: true }));
    await expect(result).resolves.toBe('ok');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(SITEVERIFY);
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('content-type')).toBe('application/x-www-form-urlencoded');
    const body = init.body as URLSearchParams;
    expect(body.get('secret')).toBe('real-secret');
    expect(body.get('response')).toBe('token-123');
    expect(body.get('remoteip')).toBe('203.0.113.7');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('omits remoteip when the address is unknown', async () => {
    const { fetchImpl, result } = verify(ok({ success: true }), { ip: 'unknown' });
    await result;
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.body as URLSearchParams).has('remoteip')).toBe(false);
  });

  it('returns captcha_failed for success:false', async () => {
    const { result } = verify(ok({ success: false, 'error-codes': ['invalid-input-response'] }));
    await expect(result).resolves.toBe('captcha_failed');
  });

  it('returns captcha_failed without calling Cloudflare when the token is missing', async () => {
    const { result, fetchImpl } = verify(ok({ success: true }), { token: '  ' });
    await expect(result).resolves.toBe('captcha_failed');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns captcha_unavailable for a non-2xx response', async () => {
    const { result } = verify(() => new Response('oops', { status: 500 }));
    await expect(result).resolves.toBe('captcha_unavailable');
  });

  it('returns captcha_unavailable for a network error', async () => {
    const { result } = verify(() => {
      throw new TypeError('fetch failed');
    });
    await expect(result).resolves.toBe('captcha_unavailable');
  });

  it('returns captcha_unavailable when the response is not JSON', async () => {
    const { result } = verify(() => new Response('<html>', { status: 200 }));
    await expect(result).resolves.toBe('captcha_unavailable');
  });

  it('aborts after the timeout and returns captcha_unavailable', async () => {
    vi.useFakeTimers();
    try {
      const fetchImpl = vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError')),
            );
          }),
      );
      const result = verifyTurnstile({
        secret: 'real-secret',
        token: 'token-123',
        siteUrl: 'https://ikcloudsolutions.com',
        tier: 'local',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      await vi.advanceTimersByTimeAsync(4000);
      await expect(result).resolves.toBe('captcha_unavailable');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('hostname binding (the five cases in design 4.8.3)', () => {
  const hostnameCase = (
    tier: 'production' | 'preview' | 'local',
    secret: string,
    hostname: string,
  ) => verify(ok({ success: true, hostname }), { tier, secret }).result;

  it('production + real secret + mismatching hostname -> captcha_failed', async () => {
    await expect(hostnameCase('production', 'real-secret', 'other.example')).resolves.toBe(
      'captcha_failed',
    );
  });

  it('production + real secret + matching hostname -> ok', async () => {
    await expect(hostnameCase('production', 'real-secret', 'ikcloudsolutions.com')).resolves.toBe(
      'ok',
    );
  });

  it('production + Cloudflare test secret + any hostname -> ok', async () => {
    await expect(hostnameCase('production', TEST_SECRET, 'anything.example')).resolves.toBe('ok');
  });

  it('preview + real secret + any hostname -> ok', async () => {
    await expect(hostnameCase('preview', 'real-secret', 'x.vercel.app')).resolves.toBe('ok');
  });

  it('local + any -> ok', async () => {
    await expect(hostnameCase('local', 'real-secret', 'localhost')).resolves.toBe('ok');
  });

  it('production with an unusable site URL fails closed', async () => {
    const { result } = verify(ok({ success: true, hostname: 'x' }), {
      tier: 'production',
      siteUrl: '',
    });
    await expect(result).resolves.toBe('captcha_failed');
  });
});
