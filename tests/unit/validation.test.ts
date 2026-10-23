import { firstErrorPerField } from '@/lib/validation/common';
import {
  intakeSteps,
  parseIntakePrefill,
  stepIndexForField,
  validateIntakeStep,
} from '@/lib/validation/intake';
import {
  agentLeadSchema,
  contactSchema,
  createConsultationSchema,
  createLeadSchema,
} from '@/lib/validation/lead';

// 2026-10-22 12:00 UTC is 13:00 in London (BST). The clock is injected, never read.
const fixedNow = () => new Date('2026-10-22T12:00:00Z');
const schema = createLeadSchema(fixedNow);

const contact = {
  type: 'contact',
  firstName: 'Alex',
  lastName: 'Murray',
  email: 'Alex@Example.com',
  subject: 'Cloud costs',
  interest: 'FinOps review',
  message: 'We would like help reviewing our cloud bill.',
};

const consultation = {
  type: 'consultation',
  name: 'Alex Murray',
  email: 'alex@example.com',
  focus: 'FinOps review',
  cloudProvider: 'AWS',
  monthlySpend: '£5k-£25k',
  preferredTimeWindow: 'morning',
};

const agentLead = {
  type: 'agent-lead',
  contactName: 'Alex Murray',
  businessName: 'Meadowbank Dental Practice',
  email: 'alex@example.com',
  industry: 'clinics',
  channel: 'voice',
  plan: 'starter',
  setupPreference: 'done-for-you',
  consent: true,
};

function fields(input: unknown, s: { safeParse: (v: unknown) => unknown } = schema) {
  const result = s.safeParse(input) as {
    success: boolean;
    error?: { issues: Parameters<typeof firstErrorPerField>[0] };
  };
  return result.success ? null : firstErrorPerField(result.error?.issues ?? []);
}

describe('valid payloads', () => {
  it('accepts each lead type and normalises values', () => {
    const parsed = schema.parse(contact);
    expect(parsed).toMatchObject({ email: 'alex@example.com', marketingOptIn: false });
    expect(schema.parse(consultation)).toMatchObject({ type: 'consultation' });
    expect(schema.parse(agentLead)).toMatchObject({
      type: 'agent-lead',
      billing: 'monthly',
      addons: [],
      hasNoWebsite: false,
    });
  });
});

describe('required fields', () => {
  it.each(['firstName', 'lastName', 'email', 'subject', 'interest', 'message'])(
    'contact: missing %s is an error on that field',
    (key) => {
      const { [key]: _removed, ...rest } = contact as Record<string, unknown>;
      expect(fields(rest)).toHaveProperty(key);
    },
  );

  it.each(['name', 'email', 'focus', 'cloudProvider', 'monthlySpend', 'preferredTimeWindow'])(
    'consultation: missing %s is an error on that field',
    (key) => {
      const { [key]: _removed, ...rest } = consultation as Record<string, unknown>;
      expect(fields(rest)).toHaveProperty(key);
    },
  );

  it.each([
    'contactName',
    'businessName',
    'email',
    'industry',
    'channel',
    'plan',
    'setupPreference',
    'consent',
  ])('agent-lead: missing %s is an error on that field', (key) => {
    const { [key]: _removed, ...rest } = agentLead as Record<string, unknown>;
    expect(fields(rest)).toHaveProperty(key);
  });

  it('rejects a missing or unknown type on the type field', () => {
    expect(fields({ ...contact, type: undefined })).toHaveProperty('type');
    expect(fields({ ...contact, type: 'newsletter' })).toHaveProperty('type');
  });
});

describe('boundaries', () => {
  it('enforces length limits', () => {
    expect(fields({ ...contact, firstName: 'a'.repeat(61) })).toHaveProperty('firstName');
    expect(fields({ ...contact, firstName: 'a'.repeat(60) })).toBeNull();
    expect(fields({ ...contact, subject: 'ab' })).toHaveProperty('subject');
    expect(fields({ ...contact, message: 'too short' })).toHaveProperty('message');
    expect(fields({ ...contact, message: 'm'.repeat(4000) })).toBeNull();
    expect(fields({ ...contact, message: 'm'.repeat(4001) })).toHaveProperty('message');
    expect(fields({ ...consultation, name: 'A' })).toHaveProperty('name');
    expect(fields({ ...consultation, notes: 'n'.repeat(2001) })).toHaveProperty('notes');
    expect(fields({ ...consultation, phone: '123456' })).toHaveProperty('phone');
    expect(fields({ ...consultation, phone: '+44 1592 000000' })).toBeNull();
    expect(fields({ ...consultation, phone: 'call me' })).toHaveProperty('phone');
    expect(fields({ ...contact, email: `${'a'.repeat(250)}@x.co` })).toHaveProperty('email');
  });

  it('treats empty optional fields as absent', () => {
    const parsed = schema.parse({ ...consultation, phone: '', company: '  ', notes: '' });
    expect(parsed).not.toHaveProperty('phone', expect.anything());
    expect(parsed).toMatchObject({ phone: undefined, company: undefined, notes: undefined });
  });
});

describe('injection', () => {
  it('rejects CR/LF in an email before it is trimmed', () => {
    expect(fields({ ...contact, email: 'a@example.com\r\nBcc: x@example.com' })).toHaveProperty(
      'email',
    );
    expect(fields({ ...contact, email: 'a@example.com\n' })).toHaveProperty('email');
  });

  it('collapses CR/LF in single-line fields to a space', () => {
    const parsed = schema.parse({
      ...contact,
      firstName: 'Alex\r\nBcc: evil@example.com',
      subject: 'Hello\nthere friend',
    });
    expect(parsed).toMatchObject({
      firstName: 'Alex Bcc: evil@example.com',
      subject: 'Hello there friend',
    });
    expect(JSON.stringify(parsed)).not.toMatch(/\\r|\\n/);
  });

  it('keeps line breaks in multiline fields but strips control characters', () => {
    const parsed = schema.parse({
      ...contact,
      message: 'First line of the message\r\nSecond line\u0000 here',
    });
    expect(parsed).toMatchObject({ message: 'First line of the message\nSecond line here' });
  });
});

describe('unknown keys', () => {
  it('rejects fields that are not in the schema', () => {
    expect(fields({ ...contact, bcc: 'evil@example.com' })).toHaveProperty('_form');
  });

  it('rejects the other name key', () => {
    expect(fields({ ...agentLead, name: 'Alex Murray' })).toHaveProperty('_form');
    expect(fields({ ...consultation, contactName: 'Alex Murray' })).toHaveProperty('_form');
  });
});

describe('website URL', () => {
  const website = (value: string) => agentLeadSchema.safeParse({ ...agentLead, websiteUrl: value });

  it('adds https:// and keeps the host', () => {
    expect(schema.parse({ ...agentLead, websiteUrl: 'example.com' })).toMatchObject({
      websiteUrl: 'https://example.com',
    });
    expect(schema.parse({ ...agentLead, websiteUrl: ' http://example.co.uk/path ' })).toMatchObject(
      {
        websiteUrl: 'http://example.co.uk/path',
      },
    );
    expect(schema.parse({ ...agentLead, websiteUrl: 'example.com:8080' })).toMatchObject({
      websiteUrl: 'https://example.com:8080',
    });
  });

  it('rejects javascript:, other schemes, undotted hosts and spaces', () => {
    expect(website('javascript:alert(1)').success).toBe(false);
    expect(website('ftp://example.com').success).toBe(false);
    expect(website('localhost').success).toBe(false);
    expect(website('exa mple.com').success).toBe(false);
    expect(website(`https://example.com/${'a'.repeat(2048)}`).success).toBe(false);
  });

  it('discards the URL when there is no website', () => {
    const parsed = schema.parse({ ...agentLead, hasNoWebsite: true, websiteUrl: 'example.com' });
    expect(parsed).toMatchObject({ hasNoWebsite: true, websiteUrl: undefined });
  });

  it('allows an empty website', () => {
    expect(fields({ ...agentLead, websiteUrl: '' })).toBeNull();
  });
});

describe('industry', () => {
  it('requires industryOther when the industry is other', () => {
    expect(fields({ ...agentLead, industry: 'other' })).toHaveProperty('industryOther');
    expect(
      fields({ ...agentLead, industry: 'other', industryOther: 'x'.repeat(81) }),
    ).toHaveProperty('industryOther');
    expect(schema.parse({ ...agentLead, industry: 'other', industryOther: 'Vets' })).toMatchObject({
      industryOther: 'Vets',
    });
  });

  it('discards industryOther for every other industry', () => {
    expect(schema.parse({ ...agentLead, industryOther: 'Vets' })).toMatchObject({
      industry: 'clinics',
      industryOther: undefined,
    });
  });
});

describe('consent, add-ons and enums', () => {
  it('requires consent to be literally true', () => {
    expect(fields({ ...agentLead, consent: false })).toHaveProperty(
      'consent',
      'Please confirm you agree to us using your details',
    );
    expect(fields({ ...agentLead, consent: 'true' })).toHaveProperty('consent');
  });

  it('requires unique, known add-on ids', () => {
    expect(fields({ ...agentLead, addons: ['domain', 'domain'] })).toHaveProperty('addons');
    expect(fields({ ...agentLead, addons: ['nope'] })).toHaveProperty('addons.0');
    expect(schema.parse({ ...agentLead, addons: ['domain', 'extra-language'] })).toMatchObject({
      addons: ['domain', 'extra-language'],
    });
  });

  it('rejects unknown enum values', () => {
    expect(fields({ ...agentLead, plan: 'enterprise' })).toHaveProperty('plan');
    expect(fields({ ...agentLead, channel: 'sms' })).toHaveProperty('channel');
    expect(fields({ ...contact, interest: 'Crypto' })).toHaveProperty('interest');
  });

  it('validates the client reference format', () => {
    expect(fields({ ...contact, clientReference: 'IK-7F3K9QX2' })).toBeNull();
    expect(fields({ ...contact, clientReference: 'IK-0000OOOO' })).toHaveProperty(
      'clientReference',
    );
  });

  it('accepts the honeypot key without erroring on its presence', () => {
    expect(fields({ ...contact, hp_confirm_ref: '' })).toBeNull();
  });
});

describe('preferred date window (Europe/London)', () => {
  const consult = createConsultationSchema(fixedNow);
  const withDate = (preferredDate: string) => fields({ ...consultation, preferredDate }, consult);

  it('accepts today and the 90th day', () => {
    expect(withDate('2026-10-22')).toBeNull();
    expect(withDate('2027-01-20')).toBeNull();
  });

  it('rejects the past, day 91 and impossible dates', () => {
    expect(withDate('2026-10-21')).toHaveProperty('preferredDate');
    expect(withDate('2027-01-21')).toHaveProperty('preferredDate');
    expect(withDate('2026-02-30')).toHaveProperty('preferredDate');
    expect(withDate('22/10/2026')).toHaveProperty('preferredDate');
  });

  it('uses the London calendar date, not UTC', () => {
    // 23:30 UTC on 22 Oct is 00:30 on 23 Oct in London during BST.
    const late = createConsultationSchema(() => new Date('2026-10-22T23:30:00Z'));
    expect(fields({ ...consultation, preferredDate: '2026-10-22' }, late)).toHaveProperty(
      'preferredDate',
    );
    expect(fields({ ...consultation, preferredDate: '2026-10-23' }, late)).toBeNull();
  });

  it('is optional', () => {
    expect(fields(consultation, consult)).toBeNull();
  });
});

describe('per-type schemas', () => {
  it('contactSchema and agentLeadSchema can be used on their own', () => {
    expect(contactSchema.safeParse(contact).success).toBe(true);
    expect(agentLeadSchema.safeParse(agentLead).success).toBe(true);
  });
});

describe('intake', () => {
  it('has six steps in order', () => {
    expect(intakeSteps.map((step) => step.id)).toEqual([
      'business',
      'channels',
      'plan',
      'setup',
      'contact',
      'review',
    ]);
  });

  it('validates one step at a time', () => {
    expect(validateIntakeStep('business', {})).toHaveProperty('businessName');
    expect(
      validateIntakeStep('business', {
        businessName: 'Pennant Heating and Plumbing',
        industry: 'other',
      }),
    ).toHaveProperty('industryOther');
    expect(
      validateIntakeStep('business', {
        businessName: 'Pennant Heating and Plumbing',
        industry: 'home-services',
      }),
    ).toEqual({});
    expect(validateIntakeStep('channels', {})).toHaveProperty('channel');
    expect(validateIntakeStep('channels', { channel: 'both' })).toEqual({});
    expect(validateIntakeStep('plan', {})).toHaveProperty('plan');
    expect(validateIntakeStep('plan', { plan: 'pro' })).toEqual({});
    expect(validateIntakeStep('setup', {})).toHaveProperty('setupPreference');
    expect(validateIntakeStep('contact', {})).toHaveProperty('contactName');
    expect(
      validateIntakeStep('contact', { contactName: 'Alex Murray', email: 'alex@example.com' }),
    ).toEqual({});
    expect(validateIntakeStep('review', { consent: false })).toHaveProperty('consent');
    expect(validateIntakeStep('review', { consent: true })).toEqual({});
  });

  it('maps a field to the step that owns it', () => {
    expect(stepIndexForField('businessName')).toBe(0);
    expect(stepIndexForField('plan')).toBe(2);
    expect(stepIndexForField('email')).toBe(4);
    expect(stepIndexForField('consent')).toBe(5);
    expect(stepIndexForField('something-else')).toBe(5);
  });

  it('ignores invalid pre-fill values', () => {
    expect(parseIntakePrefill({ plan: 'pro', channel: 'both', billing: 'annual' })).toEqual({
      plan: 'pro',
      channel: 'both',
      billing: 'annual',
    });
    expect(
      parseIntakePrefill({ plan: 'gold', channel: ['voice', 'x'], billing: 'weekly' }),
    ).toEqual({ plan: undefined, channel: 'voice', billing: undefined });
  });

  it('pre-fills a valid industry and ignores an unknown one', () => {
    expect(parseIntakePrefill({ industry: 'clinics' }).industry).toBe('clinics');
    expect(parseIntakePrefill({ industry: 'bakery' }).industry).toBeUndefined();
  });

  it('keeps valid, unique add-on ids and drops unknown ones', () => {
    expect(
      parseIntakePrefill({ addons: 'website-express, domain,website-express,nonsense,,' }).addons,
    ).toEqual(['website-express', 'domain']);
    expect(parseIntakePrefill({ addons: 'nonsense' }).addons).toBeUndefined();
    expect(parseIntakePrefill({}).addons).toBeUndefined();
  });
});
