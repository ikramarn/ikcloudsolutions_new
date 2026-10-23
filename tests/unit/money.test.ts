import {
  addVat,
  displayAmount,
  displayUnitRate,
  formatMoney,
  formatPoundsFromTenths,
  priceIn,
  vatNote,
  vatPhrase,
  type VatSettings,
} from '@/lib/money';

const inclusive: VatSettings = { mode: 'inclusive', ratePercent: 20 };
const exclusive: VatSettings = { mode: 'exclusive', ratePercent: 20 };
const notRegistered: VatSettings = { mode: 'not-registered', ratePercent: 20 };

describe('formatMoney', () => {
  it('formats pence as en-GB pounds', () => {
    expect(formatMoney(7110, 'GBP')).toBe('£71.10');
    expect(formatMoney(268920, 'GBP')).toBe('£2,689.20');
  });

  it('drops zero decimals only for whole pounds when asked', () => {
    expect(formatMoney(7900, 'GBP', { dropZeroDecimals: true })).toBe('£79');
    expect(formatMoney(7110, 'GBP', { dropZeroDecimals: true })).toBe('£71.10');
    expect(formatMoney(7900, 'GBP')).toBe('£79.00');
  });
});

describe('addVat', () => {
  it('rounds once, in pence', () => {
    expect(addVat(7900, 20)).toBe(9480);
    expect(addVat(12345, 20)).toBe(14814);
  });
});

describe('formatPoundsFromTenths', () => {
  it('uses 2 decimals for whole pence and 3 otherwise', () => {
    expect(formatPoundsFromTenths(20)).toBe('£0.02');
    expect(formatPoundsFromTenths(24)).toBe('£0.024');
    expect(formatPoundsFromTenths(200)).toBe('£0.20');
    expect(formatPoundsFromTenths(240)).toBe('£0.24');
  });

  it('throws on zero, negative and non-integer input', () => {
    expect(() => formatPoundsFromTenths(0)).toThrow();
    expect(() => formatPoundsFromTenths(-20)).toThrow();
    expect(() => formatPoundsFromTenths(1.5)).toThrow();
  });
});

describe('displayUnitRate', () => {
  it('adds VAT in tenths when inclusive', () => {
    expect(displayUnitRate(20, inclusive)).toBe('£0.024');
    expect(displayUnitRate(200, inclusive)).toBe('£0.24');
  });

  it('shows the net rate otherwise', () => {
    expect(displayUnitRate(20, exclusive)).toBe('£0.02');
    expect(displayUnitRate(200, exclusive)).toBe('£0.20');
    expect(displayUnitRate(20, notRegistered)).toBe('£0.02');
  });
});

describe('displayAmount', () => {
  it('only inclusive mode changes the figure', () => {
    expect(displayAmount(7900, inclusive)).toBe(9480);
    expect(displayAmount(7900, exclusive)).toBe(7900);
    expect(displayAmount(7900, notRegistered)).toBe(7900);
  });
});

describe('VAT wording', () => {
  it('has a note per mode', () => {
    expect(vatNote('exclusive')).toBe('+ VAT');
    expect(vatNote('inclusive')).toBe('inc. VAT');
    expect(vatNote('not-registered')).toBe('');
  });

  it('has a sentence per mode', () => {
    expect(vatPhrase('exclusive')).toBe('Prices exclude VAT (shown as + VAT).');
    expect(vatPhrase('inclusive')).toBe('Prices include VAT at 20%.');
    expect(vatPhrase('not-registered')).toBe('We are not VAT registered, so no VAT is added.');
  });
});

describe('priceIn', () => {
  it('reads the book for the currency', () => {
    expect(priceIn({ GBP: 7900 }, 'GBP')).toBe(7900);
  });
});
