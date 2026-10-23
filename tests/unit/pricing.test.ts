import { pricingConfig, type PricingConfig } from '@/config/pricing';
import {
  decimalFromMinor,
  displayAmount,
  displayUnitRate,
  formatMoney,
  priceIn,
  type VatMode,
} from '@/lib/money';
import {
  annualMonthlyEquivalent,
  annualSaving,
  annualTotal,
  displayPrice,
  effectiveAllowances,
  estimateTotals,
  validatePricingConfig,
  type EstimateSelection,
} from '@/lib/pricing';
import { offerJsonLd } from '@/lib/seo/jsonld';

const [starter, pro, premium] = pricingConfig.plans;
const inclusive = { mode: 'inclusive', ratePercent: 20 } as const;

function select(overrides: Partial<EstimateSelection>): EstimateSelection {
  return {
    planId: 'starter',
    billing: 'monthly',
    channel: 'voice',
    setupPreference: 'self-serve-later',
    addonIds: [],
    ...overrides,
  };
}

describe('annual maths', () => {
  it('reproduces the design vectors', () => {
    expect(annualTotal(7900, 10)).toBe(85320);
    expect(annualTotal(24900, 10)).toBe(268920);
    expect(annualTotal(64900, 10)).toBe(700920);
    expect(annualMonthlyEquivalent(85320)).toBe(7110);
    expect(annualSaving(7900, 10)).toBe(9480);
  });

  it('matches the configured plans', () => {
    expect(pricingConfig.plans.map((plan) => priceIn(plan.monthly, 'GBP'))).toEqual([
      7900, 24900, 64900,
    ]);
    expect(pricingConfig.annualDiscountPercent).toBe(10);
  });
});

describe('displayAmount with the configured plans', () => {
  it('shows Starter monthly inclusive as 9480', () => {
    expect(displayAmount(priceIn(starter.monthly, 'GBP'), inclusive)).toBe(9480);
    expect(displayAmount(7900, { mode: 'exclusive', ratePercent: 20 })).toBe(7900);
  });
});

describe('displayPrice', () => {
  it('shows the monthly and annual headline for each VAT mode', () => {
    const exclusive = { mode: 'exclusive', ratePercent: 20 } as const;
    expect(displayPrice(starter, 'monthly', 'GBP', exclusive)).toMatchObject({
      headline: 7900,
      vatLabel: '+ VAT',
    });
    const annual = displayPrice(starter, 'annual', 'GBP', exclusive);
    expect(annual.headline).toBe(7110);
    expect(annual.billedLabel).toBe('billed £853.20 a year');
    expect(annual.savingLabel).toBe('save £94.80 a year');
    expect(displayPrice(starter, 'monthly', 'GBP', inclusive).headline).toBe(9480);
  });
});

describe('estimateTotals vectors', () => {
  it('Starter, annual, voice, second channel', () => {
    expect(
      estimateTotals(select({ billing: 'annual', addonIds: ['second-channel'] })),
    ).toMatchObject({
      planBilledNow: 85320,
      monthlyRecurring: 3900,
      yearlyRecurring: 85320,
      oneTime: 0,
      firstPayment: 89220,
    });
  });

  it('Pro, monthly, both, knowledge base and a coming-soon add-on', () => {
    expect(
      estimateTotals(
        select({
          planId: 'pro',
          channel: 'both',
          addonIds: ['kb-essentials', 'extra-language'],
        }),
      ),
    ).toMatchObject({
      oneTime: 14900,
      monthlyRecurring: 24900,
      firstPayment: 39800,
      ignored: ['extra-language'],
    });
  });

  it('Starter, monthly, voice, done-for-you', () => {
    expect(estimateTotals(select({ setupPreference: 'done-for-you' }))).toMatchObject({
      oneTime: 39900,
      firstPayment: 47800,
    });
  });

  it('Pro, annual, both, done-for-you, extra number', () => {
    expect(
      estimateTotals(
        select({
          planId: 'pro',
          billing: 'annual',
          channel: 'both',
          setupPreference: 'done-for-you',
          addonIds: ['extra-number'],
        }),
      ),
    ).toMatchObject({
      planBilledNow: 268920,
      oneTime: 94900,
      monthlyRecurring: 500,
      yearlyRecurring: 268920,
      firstPayment: 364320,
    });
  });

  it('ignores a plan-restricted add-on', () => {
    const totals = estimateTotals(select({ planId: 'pro', addonIds: ['second-channel'] }));
    expect(totals?.ignored).toEqual(['second-channel']);
    expect(totals?.monthlyRecurring).toBe(24900);
  });

  it('auto-adds the second channel for Starter with both channels', () => {
    expect(estimateTotals(select({ channel: 'both' }))).toMatchObject({
      autoAdded: ['second-channel'],
      monthlyRecurring: 11800,
    });
  });

  it('does not auto-add when the second channel is already selected', () => {
    const totals = estimateTotals(select({ channel: 'both', addonIds: ['second-channel'] }));
    expect(totals?.autoAdded).toEqual([]);
    expect(totals?.monthlyRecurring).toBe(11800);
  });

  it('returns null when the visitor is not sure of a plan', () => {
    expect(estimateTotals(select({ planId: 'not-sure' }))).toBeNull();
  });

  it('flags a "from" setup price and counts the yearly domain fee once', () => {
    const totals = estimateTotals(
      select({
        planId: 'premium',
        channel: 'both',
        setupPreference: 'done-for-you',
        addonIds: ['domain', 'domain'],
      }),
    );
    expect(totals).toMatchObject({
      oneTimeIsFrom: true,
      oneTime: 195000,
      yearlyRecurring: 600,
      firstPayment: 64900 + 195000 + 600,
    });
  });
});

describe('effectiveAllowances', () => {
  it('keeps the two channels apart on Starter', () => {
    expect(effectiveAllowances(starter, 'voice', [])).toEqual({
      voiceMinutes: 200,
      whatsappAiReplies: 0,
    });
    expect(effectiveAllowances(starter, 'whatsapp', [])).toEqual({
      voiceMinutes: 0,
      whatsappAiReplies: 1000,
    });
    expect(effectiveAllowances(starter, 'voice', ['second-channel'])).toEqual({
      voiceMinutes: 200,
      whatsappAiReplies: 1000,
    });
  });

  it('gives Pro and Premium both allowances', () => {
    expect(effectiveAllowances(pro, 'voice', [])).toEqual({
      voiceMinutes: 500,
      whatsappAiReplies: 5000,
    });
    expect(effectiveAllowances(premium, 'whatsapp', [])).toEqual({
      voiceMinutes: 1200,
      whatsappAiReplies: 12000,
    });
  });
});

describe('config invariants', () => {
  it('passes validatePricingConfig', () => {
    expect(() => validatePricingConfig(pricingConfig)).not.toThrow();
  });

  it('has no combined allowance field on any plan', () => {
    for (const plan of pricingConfig.plans) {
      expect(Object.keys(plan.allowances).sort()).toEqual([
        'agents',
        'changeHoursPerMonth',
        'integrations',
        'voiceMinutes',
        'whatsappAiReplies',
      ]);
      expect(Object.keys(plan)).not.toContain('units');
    }
  });

  it('rejects broken configs', () => {
    const broken: PricingConfig = {
      ...pricingConfig,
      annualDiscountPercent: 0,
    };
    expect(() => validatePricingConfig(broken)).toThrow(/annual total/);

    const badOverage: PricingConfig = {
      ...pricingConfig,
      plans: [
        {
          ...starter,
          overage: {
            voicePerMinuteTenthsPence: { GBP: 0 },
            whatsappPerReplyTenthsPence: { GBP: 20 },
          },
        },
        pro,
        premium,
      ],
    };
    expect(() => validatePricingConfig(badOverage)).toThrow(/voice overage/);

    const duplicate: PricingConfig = {
      ...pricingConfig,
      addons: [...pricingConfig.addons, pricingConfig.addons[0]!],
    };
    expect(() => validatePricingConfig(duplicate)).toThrow(/unique/);
  });

  it('matches the config snapshot', () => {
    expect(pricingConfig).toMatchSnapshot();
  });

  it('shows two separate overage rates in every VAT mode', () => {
    const modes: VatMode[] = ['exclusive', 'inclusive', 'not-registered'];
    const expected: Record<VatMode, [string, string]> = {
      exclusive: ['£0.20', '£0.02'],
      inclusive: ['£0.24', '£0.024'],
      'not-registered': ['£0.20', '£0.02'],
    };
    for (const mode of modes) {
      const vat = { mode, ratePercent: 20 };
      expect([
        displayUnitRate(priceIn(starter.overage.voicePerMinuteTenthsPence, 'GBP'), vat),
        displayUnitRate(priceIn(starter.overage.whatsappPerReplyTenthsPence, 'GBP'), vat),
      ]).toEqual(expected[mode]);
    }
  });
});

describe('margin model', () => {
  // Recomputes the cost-basis comment in src/config/pricing.ts from its constants.
  const fx = 1.3;
  const voiceCost = 0.11 / fx;
  const replyCost = 0.006 / fx;
  const infra: Record<string, number> = {
    starter: 1.54 + 2.31,
    pro: 3.08 + 4.62,
    premium: 7.69 + 11.54,
  };
  const supportHours: Record<string, number> = { starter: 0.25, pro: 1.5, premium: 5 };

  function margin(planId: 'starter' | 'pro' | 'premium', annual: boolean): number {
    const plan = pricingConfig.plans.find((candidate) => candidate.id === planId)!;
    const monthlyPounds = priceIn(plan.monthly, 'GBP') / 100;
    const revenue = annual
      ? annualMonthlyEquivalent(annualTotal(priceIn(plan.monthly, 'GBP'), 10)) / 100
      : monthlyPounds;
    const chargePounds = annual ? revenue * 12 : revenue;
    const payment = (0.03 * chargePounds + 0.3) / (annual ? 12 : 1);
    const cost =
      plan.allowances.voiceMinutes * voiceCost +
      plan.allowances.whatsappAiReplies * replyCost +
      infra[planId]! +
      supportHours[planId]! * 25 +
      payment;
    return (revenue - cost) / revenue;
  }

  it('keeps every plan at or above 45% gross margin at full use', () => {
    for (const id of ['starter', 'pro', 'premium'] as const) {
      expect(margin(id, false)).toBeGreaterThanOrEqual(0.45);
      expect(margin(id, true)).toBeGreaterThanOrEqual(0.45);
    }
  });

  it('agrees with the figures in the comment', () => {
    expect(margin('starter', false)).toBeCloseTo(0.566, 2);
    expect(margin('pro', false)).toBeCloseTo(0.525, 2);
    expect(margin('premium', false)).toBeCloseTo(0.506, 2);
  });
});

describe('JSON-LD price', () => {
  it('equals the displayed amount for every VAT mode', () => {
    const net = priceIn(starter.monthly, 'GBP');
    for (const mode of ['exclusive', 'inclusive', 'not-registered'] as const) {
      const vat = { mode, ratePercent: 20 };
      const shown = displayAmount(net, vat);
      const offer = offerJsonLd({
        name: 'Starter',
        price: decimalFromMinor(shown),
        valueAddedTaxIncluded: mode === 'inclusive',
      });
      expect(`£${offer.price}`).toBe(formatMoney(shown, 'GBP'));
    }
  });
});
