import type {
  BreadcrumbList,
  FAQPage,
  Offer,
  OfferCatalog,
  Organization,
  ProfessionalService,
  Service,
  WebSite,
  WithContext,
} from 'schema-dts';
import { siteConfig } from '@/config/site';

const origin = () => siteConfig.url;
const absolute = (path: string) => `${origin()}${path}`;

/** JSON.stringify, then escape '<' so the payload can never close the script tag. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const postalAddress = () =>
  ({
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.locality,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  }) as const;

export function organizationJsonLd(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absolute('/#organization'),
    name: siteConfig.name,
    ...(siteConfig.legalName ? { legalName: siteConfig.legalName } : {}),
    url: origin(),
    logo: absolute('/logo.png'),
    email: siteConfig.email,
    address: postalAddress(),
    founder: { '@type': 'Person', name: siteConfig.founder.name },
    areaServed: 'GB',
    ...(siteConfig.sameAs.length > 0 ? { sameAs: [...siteConfig.sameAs] } : {}),
  };
}

export function websiteJsonLd(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absolute('/#website'),
    url: origin(),
    name: siteConfig.name,
    inLanguage: 'en-GB',
    publisher: { '@id': absolute('/#organization') },
  };
}

export function professionalServiceJsonLd(): WithContext<ProfessionalService> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': absolute('/#business'),
    name: siteConfig.name,
    url: origin(),
    email: siteConfig.email,
    address: postalAddress(),
    areaServed: 'United Kingdom',
    parentOrganization: { '@id': absolute('/#organization') },
  };
}

export interface BreadcrumbPoint {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(points: readonly BreadcrumbPoint[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: points.map((point, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: point.name,
      item: absolute(point.path),
    })),
  };
}

export interface ResolvedFaq {
  question: string;
  /** Plain text: the same resolved string the page renders. */
  answer: string;
}

export function faqJsonLd(items: readonly ResolvedFaq[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export interface ServiceJsonLdInput {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  catalog?: OfferCatalog;
}

export function serviceJsonLd(input: ServiceJsonLdInput): WithContext<Service> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: absolute(input.path),
    serviceType: input.serviceType,
    provider: { '@id': absolute('/#organization') },
    areaServed: 'GB',
    ...(input.catalog ? { hasOfferCatalog: input.catalog } : {}),
  };
}

export interface OfferInput {
  name: string;
  /** Decimal string equal to the figure shown on the page, for example "79.00". */
  price: string;
  billingDuration?: string;
  valueAddedTaxIncluded: boolean;
  availability?: 'PreOrder' | 'InStock';
}

export function offerJsonLd(input: OfferInput): Offer {
  return {
    '@type': 'Offer',
    name: input.name,
    price: input.price,
    priceCurrency: 'GBP',
    availability: `https://schema.org/${input.availability ?? 'PreOrder'}`,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: input.price,
      priceCurrency: 'GBP',
      ...(input.billingDuration ? { billingDuration: input.billingDuration } : {}),
      valueAddedTaxIncluded: input.valueAddedTaxIncluded,
    },
  };
}

export function offerCatalogJsonLd(name: string, offers: readonly Offer[]): OfferCatalog {
  return {
    '@type': 'OfferCatalog',
    name,
    itemListElement: [...offers],
  };
}
