import { describe, expect, it } from 'vitest';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { displayPrice } from '@/lib/pricing';
import { decimalFromMinor, type VatMode } from '@/lib/money';
import { pricingServiceJsonLd } from '@/lib/seo/pricing-jsonld';

interface PlainOffer {
  price: string;
  priceCurrency: string;
  priceSpecification: { price: string; valueAddedTaxIncluded: boolean };
}

const VAT_MODES: VatMode[] = ['exclusive', 'inclusive', 'not-registered'];
const withMode = (mode: VatMode): PricingConfig => ({
  ...pricingConfig,
  vat: { mode, ratePercent: 20 },
});

function offers(config: PricingConfig): PlainOffer[] {
  const json = JSON.parse(JSON.stringify(pricingServiceJsonLd(config))) as {
    hasOfferCatalog: { itemListElement: PlainOffer[] };
  };
  return json.hasOfferCatalog.itemListElement;
}

describe('JSON-LD offer prices match what the pricing table shows', () => {
  it.each(VAT_MODES)('in %s mode', (mode) => {
    const config = withMode(mode);
    const shown = config.plans.map((plan) =>
      decimalFromMinor(
        displayPrice(plan, 'monthly', config.currency, config.vat, config.annualDiscountPercent)
          .headline,
      ),
    );
    const found = offers(config);
    expect(found.map((offer) => offer.price)).toEqual(shown);
    expect(found.map((offer) => offer.priceSpecification.price)).toEqual(shown);
    for (const offer of found) expect(offer.priceCurrency).toBe('GBP');
  });

  it('sets valueAddedTaxIncluded only when VAT is included in the shown price', () => {
    for (const mode of VAT_MODES) {
      for (const offer of offers(withMode(mode))) {
        expect(offer.priceSpecification.valueAddedTaxIncluded, mode).toBe(mode === 'inclusive');
      }
    }
  });
});
