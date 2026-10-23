import { describe, expect, it } from 'vitest';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { decimalFromMinor, displayAmount, type VatMode } from '@/lib/money';
import { pricingServiceJsonLd } from '@/lib/seo/pricing-jsonld';

interface PlainOffer {
  name: string;
  price: string;
  availability: string;
  priceSpecification: { price: string; billingDuration: string; valueAddedTaxIncluded: boolean };
}

function withMode(mode: VatMode): PricingConfig {
  return { ...pricingConfig, vat: { mode, ratePercent: 20 } };
}

function offersFor(config: PricingConfig): PlainOffer[] {
  // schema-dts return types are unions with strings, so read the serialised form.
  const json = JSON.parse(JSON.stringify(pricingServiceJsonLd(config))) as {
    hasOfferCatalog: { itemListElement: PlainOffer[] };
  };
  return json.hasOfferCatalog.itemListElement;
}

describe('pricing Service JSON-LD', () => {
  it.each<[VatMode, string[]]>([
    ['exclusive', ['79.00', '249.00', '649.00']],
    ['inclusive', ['94.80', '298.80', '778.80']],
    ['not-registered', ['79.00', '249.00', '649.00']],
  ])('prices equal the displayed figures in %s mode', (mode, expected) => {
    const config = withMode(mode);
    const offers = offersFor(config);
    expect(offers.map((offer) => offer.price)).toEqual(expected);
    expect(offers.map((offer) => offer.priceSpecification.price)).toEqual(expected);
    const displayed = config.plans.map((plan) =>
      decimalFromMinor(displayAmount(plan.monthly.GBP, config.vat)),
    );
    expect(offers.map((offer) => offer.price)).toEqual(displayed);
  });

  it('marks VAT included only in inclusive mode', () => {
    expect(
      offersFor(withMode('inclusive')).every((o) => o.priceSpecification.valueAddedTaxIncluded),
    ).toBe(true);
    expect(
      offersFor(withMode('exclusive')).some((o) => o.priceSpecification.valueAddedTaxIncluded),
    ).toBe(false);
    expect(
      offersFor(withMode('not-registered')).some((o) => o.priceSpecification.valueAddedTaxIncluded),
    ).toBe(false);
  });

  it('is pre-order and billed monthly', () => {
    for (const offer of offersFor(pricingConfig)) {
      expect(offer.availability).toBe('https://schema.org/PreOrder');
      expect(offer.priceSpecification.billingDuration).toBe('P1M');
    }
  });
});
