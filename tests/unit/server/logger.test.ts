import { logEvent } from '@/lib/server/logger';

describe('logEvent', () => {
  it('writes one JSON line to stdout', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    logEvent('warn', 'lead.captcha_unavailable', { type: 'contact', status: 503, missing: ['X'] });
    expect(write).toHaveBeenCalledTimes(1);
    const line = String(write.mock.calls[0]![0]);
    expect(line.endsWith('\n')).toBe(true);
    expect(JSON.parse(line)).toEqual({
      level: 'warn',
      event: 'lead.captcha_unavailable',
      type: 'contact',
      status: 503,
      missing: ['X'],
    });
    write.mockRestore();
  });

  it('works without fields', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    logEvent('info', 'lead.sent');
    expect(JSON.parse(String(write.mock.calls[0]![0]))).toEqual({
      level: 'info',
      event: 'lead.sent',
    });
    write.mockRestore();
  });

  it('does not accept personal data fields (compile-time check)', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    // @ts-expect-error email is not a loggable field
    logEvent('info', 'lead.sent', { email: 'alex@example.com' });
    // @ts-expect-error free text is not a loggable field
    logEvent('info', 'lead.sent', { message: 'hello' });
    // @ts-expect-error IP addresses are not a loggable field
    logEvent('info', 'lead.sent', { ip: '203.0.113.7' });
    write.mockRestore();
  });
});
