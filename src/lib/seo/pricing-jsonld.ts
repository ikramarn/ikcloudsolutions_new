import type { Service, WithContext } from 'schema-dts';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { decimalFromMinor, displayAmount, priceIn } from '@/lib/money';
import { offerCatalogJsonLd, offerJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';

/**
 * The Service with one Offer per plan, generated only from the pricing config. The price string
 * equals the figure the page shows (displayAmount): net in exclusive and not-registered modes,
 * gross in inclusive mode. Availability is PreOrder while the service is pre-launch.
 */
export function pricingServiceJsonLd(
  config: PricingConfig = pricingConfig,
  path = '/ai-agents/pricing',
): WithContext<Service> {
  const offers = config.plans.map((plan) =>
    offerJsonLd({
      name: `${plan.name} plan`,
      price: decimalFromMinor(displayAmount(priceIn(plan.monthly, config.currency), config.vat)),
      billingDuration: 'P1M',
      valueAddedTaxIncluded: config.vat.mode === 'inclusive',
      availability: 'PreOrder',
    }),
  );
  return serviceJsonLd({
    name: 'AI Front Desk',
    description:
      'A managed AI receptionist for phone and WhatsApp with three monthly plans in GBP, a one-time setup fee and usage-based overage.',
    path,
    serviceType: 'AI receptionist',
    catalog: offerCatalogJsonLd('AI Front Desk plans', offers),
  });
}
