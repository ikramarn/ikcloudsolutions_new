import { describe, expect, it } from 'vitest';
import {
  breadcrumbJsonLd,
  faqJsonLd,
  offerCatalogJsonLd,
  offerJsonLd,
  organizationJsonLd,
  professionalServiceJsonLd,
  serializeJsonLd,
  serviceJsonLd,
  websiteJsonLd,
} from '@/lib/seo/jsonld';

// schema-dts types are unions with plain strings, so tests read them as plain records.
const plain = (value: object) => value as Record<string, unknown>;

describe('serializeJsonLd', () => {
  it('escapes < so a value can never close the script tag', () => {
    const output = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(output).not.toContain('<');
    expect(output).toContain('\\u003c/script>');
    expect(JSON.parse(output)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});

describe('organizationJsonLd', () => {
  const org = plain(organizationJsonLd());

  it('uses the trading name and the committed logo path', () => {
    expect(org['@type']).toBe('Organization');
    expect(org['@id']).toBe('https://example.test/#organization');
    expect(org.name).toBe('IK Cloud Solutions');
    expect(org.logo).toBe('https://example.test/logo.png');
    expect(org.areaServed).toBe('GB');
  });

  it('omits legalName and sameAs while they are unset', () => {
    expect(org).not.toHaveProperty('legalName');
    expect(org).not.toHaveProperty('sameAs');
  });

  it('gives the founder by name only and no telephone', () => {
    expect(org.founder).toEqual({ '@type': 'Person', name: 'Ikram Ullah' });
    expect(org).not.toHaveProperty('telephone');
  });
});

describe('websiteJsonLd and professionalServiceJsonLd', () => {
  it('reference the organisation and avoid invented data', () => {
    const site = plain(websiteJsonLd());
    expect(site.publisher).toEqual({ '@id': 'https://example.test/#organization' });
    expect(site).not.toHaveProperty('potentialAction');

    const business = plain(professionalServiceJsonLd());
    expect(business['@id']).toBe('https://example.test/#business');
    expect(business).not.toHaveProperty('aggregateRating');
    expect(business).not.toHaveProperty('priceRange');
    expect(business).not.toHaveProperty('openingHours');
    expect(business).not.toHaveProperty('telephone');
  });
});

describe('breadcrumbJsonLd', () => {
  it('numbers items from 1 and uses absolute URLs', () => {
    const list = plain(
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'AI Agents', path: '/ai-agents' },
      ]),
    );
    expect(list.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.test/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'AI Agents',
        item: 'https://example.test/ai-agents',
      },
    ]);
  });
});

describe('faqJsonLd', () => {
  it('maps resolved items one-to-one', () => {
    const faq = plain(faqJsonLd([{ question: 'Q?', answer: 'A.' }]));
    expect(faq.mainEntity).toEqual([
      { '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } },
    ]);
  });
});

describe('service and offer helpers', () => {
  it('builds a service with a catalogue of offers', () => {
    const offer = offerJsonLd({
      name: 'Example plan',
      price: '10.00',
      billingDuration: 'P1M',
      valueAddedTaxIncluded: false,
    });
    expect(offer).toMatchObject({
      '@type': 'Offer',
      price: '10.00',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/PreOrder',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '10.00',
        billingDuration: 'P1M',
        valueAddedTaxIncluded: false,
      },
    });

    const service = plain(
      serviceJsonLd({
        name: 'Example',
        description: 'Example service.',
        path: '/example',
        serviceType: 'AI receptionist',
        catalog: offerCatalogJsonLd('Plans', [offer]),
      }),
    );
    expect(service.url).toBe('https://example.test/example');
    expect(service.hasOfferCatalog).toMatchObject({ '@type': 'OfferCatalog', name: 'Plans' });
  });
});
