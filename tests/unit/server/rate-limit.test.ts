import { InMemoryRateLimiter, getClientIp, hashClientKey } from '@/lib/server/rate-limit';

function limiter(options: ConstructorParameters<typeof InMemoryRateLimiter>[0] = {}) {
  const clock = { now: 1_000_000 };
  return { clock, limiter: new InMemoryRateLimiter({ ...options, now: () => clock.now }) };
}

describe('InMemoryRateLimiter', () => {
  it('allows 5 requests per 10 minutes per key and then denies with Retry-After', () => {
    const { limiter: l, clock } = limiter();
    for (let i = 0; i < 5; i += 1) {
      expect(l.check('a')).toEqual({ allowed: true, retryAfterSec: 0 });
      clock.now += 1000;
    }
    const denied = l.check('a');
    expect(denied.allowed).toBe(false);
    // The oldest hit was 5 seconds ago, so 595 seconds remain.
    expect(denied.retryAfterSec).toBe(595);
  });

  it('keeps keys apart', () => {
    const { limiter: l } = limiter();
    for (let i = 0; i < 5; i += 1) l.check('a');
    expect(l.check('a').allowed).toBe(false);
    expect(l.check('b').allowed).toBe(true);
  });

  it('slides: old hits leave the window', () => {
    const { limiter: l, clock } = limiter();
    for (let i = 0; i < 5; i += 1) l.check('a');
    expect(l.check('a').allowed).toBe(false);
    clock.now += 10 * 60 * 1000;
    expect(l.check('a').allowed).toBe(true);
  });

  it('does not count denied requests against the window', () => {
    const { limiter: l, clock } = limiter();
    for (let i = 0; i < 5; i += 1) l.check('a');
    for (let i = 0; i < 20; i += 1) l.check('a');
    clock.now += 10 * 60 * 1000;
    expect(l.check('a').allowed).toBe(true);
  });

  it('prunes keys whose window has passed', () => {
    const { limiter: l, clock } = limiter({ globalLimit: 1000 });
    for (let i = 0; i < 100; i += 1) l.check(`key-${i}`);
    expect(l.size).toBe(100);
    clock.now += 10 * 60 * 1000 + 1;
    l.check('fresh');
    expect(l.size).toBe(1);
  });

  it('caps the number of tracked keys', () => {
    const { limiter: l } = limiter({ maxKeys: 50, globalLimit: 10_000 });
    for (let i = 0; i < 500; i += 1) l.check(`key-${i}`);
    expect(l.size).toBe(50);
  });

  it('applies a global ceiling of 60 per hour across keys', () => {
    const { limiter: l, clock } = limiter();
    for (let i = 0; i < 60; i += 1) expect(l.check(`key-${i}`).allowed).toBe(true);
    const denied = l.check('key-new');
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSec).toBe(3600);
    clock.now += 60 * 60 * 1000;
    expect(l.check('key-new').allowed).toBe(true);
  });

  it('does not let one key use up the global ceiling when it is already limited', () => {
    const { limiter: l } = limiter();
    for (let i = 0; i < 5; i += 1) l.check('a');
    for (let i = 0; i < 100; i += 1) l.check('a');
    expect(l.check('b').allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  const headers = (init: Record<string, string>) => new Headers(init);

  it('prefers x-vercel-forwarded-for, then x-real-ip, then the first x-forwarded-for', () => {
    expect(
      getClientIp(
        headers({
          'x-vercel-forwarded-for': '1.1.1.1',
          'x-real-ip': '2.2.2.2',
          'x-forwarded-for': '3.3.3.3, 4.4.4.4',
        }),
      ),
    ).toBe('1.1.1.1');
    expect(getClientIp(headers({ 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '3.3.3.3' }))).toBe(
      '2.2.2.2',
    );
    expect(getClientIp(headers({ 'x-forwarded-for': '3.3.3.3, 4.4.4.4' }))).toBe('3.3.3.3');
  });

  it('falls back to "unknown"', () => {
    expect(getClientIp(headers({}))).toBe('unknown');
  });
});

describe('hashClientKey', () => {
  it('is a stable SHA-256 hex digest for a salt and never the raw address', () => {
    const salt = new Uint8Array([1, 2, 3]);
    const a = hashClientKey('203.0.113.7', salt);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain('203');
    expect(hashClientKey('203.0.113.7', salt)).toBe(a);
    expect(hashClientKey('203.0.113.8', salt)).not.toBe(a);
    expect(hashClientKey('203.0.113.7', new Uint8Array([9]))).not.toBe(a);
  });
});
