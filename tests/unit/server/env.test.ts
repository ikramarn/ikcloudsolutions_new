import {
  isValidFromAddress,
  mailConfigProblems,
  parseRecipients,
  parseServerEnv,
} from '@/lib/server/env';

const full = {
  NODE_ENV: 'production',
  RESEND_API_KEY: 're_test',
  LEAD_TO_EMAIL: 'owner@example.test',
  LEAD_FROM_EMAIL: 'IK Leads <leads@example.test>',
};

describe('parseServerEnv', () => {
  it('parses the documented variables', () => {
    expect(parseServerEnv({ ...full, TURNSTILE_SECRET_KEY: 'secret' })).toMatchObject({
      NODE_ENV: 'production',
      RESEND_API_KEY: 're_test',
      TURNSTILE_SECRET_KEY: 'secret',
    });
  });

  it('defaults NODE_ENV to development and treats empty strings as unset', () => {
    const env = parseServerEnv({ RESEND_API_KEY: '', LEAD_TO_EMAIL: '   ' });
    expect(env.NODE_ENV).toBe('development');
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.LEAD_TO_EMAIL).toBeUndefined();
  });

  it('falls back to development for an unknown NODE_ENV instead of throwing', () => {
    expect(parseServerEnv({ NODE_ENV: 'staging' }).NODE_ENV).toBe('development');
  });
});

describe('parseRecipients', () => {
  it('splits on commas and keeps valid addresses only', () => {
    expect(parseRecipients('a@example.test, b@example.test ,not-an-email,')).toEqual([
      'a@example.test',
      'b@example.test',
    ]);
    expect(parseRecipients(undefined)).toEqual([]);
  });
});

describe('isValidFromAddress', () => {
  it('accepts a bare address and "Name <address>"', () => {
    expect(isValidFromAddress('leads@example.test')).toBe(true);
    expect(isValidFromAddress('IK Leads <leads@example.test>')).toBe(true);
  });

  it('rejects junk and header injection', () => {
    expect(isValidFromAddress(undefined)).toBe(false);
    expect(isValidFromAddress('not an address')).toBe(false);
    expect(isValidFromAddress('IK <leads@example.test>\r\nBcc: x@example.test')).toBe(false);
  });
});

describe('mailConfigProblems (production requires LEAD_TO_EMAIL)', () => {
  it('is empty for a complete production config', () => {
    expect(mailConfigProblems(parseServerEnv(full))).toEqual([]);
  });

  it('requires LEAD_TO_EMAIL and a provider key in production', () => {
    expect(mailConfigProblems(parseServerEnv({ NODE_ENV: 'production' }))).toEqual([
      'RESEND_API_KEY',
      'LEAD_TO_EMAIL',
    ]);
  });

  it('requires LEAD_FROM_EMAIL once a key is set', () => {
    const { LEAD_FROM_EMAIL: _from, ...withoutFrom } = full;
    expect(mailConfigProblems(parseServerEnv(withoutFrom))).toEqual(['LEAD_FROM_EMAIL']);
  });

  it('treats an invalid recipient list as missing', () => {
    expect(mailConfigProblems(parseServerEnv({ ...full, LEAD_TO_EMAIL: 'nope' }))).toEqual([
      'LEAD_TO_EMAIL',
    ]);
  });

  it('requires nothing in development', () => {
    expect(mailConfigProblems(parseServerEnv({ NODE_ENV: 'development' }))).toEqual([]);
  });
});
