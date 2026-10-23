import type { PricingConfig } from '@/config/pricing';
import { siteConfig } from '@/config/site';
import { buildCopyContext } from '@/lib/copy/faq';

// Single route registry: the source for metadata, sitemap entries, breadcrumbs, nav checks and
// the e2e route list. Page routes only (API, /og/*, sitemap, robots, manifest and icons are not
// entries). Later features append their routes here.
export interface RouteEntry {
  /** '/ai-agents/pricing' */
  path: string;
  /** Page segment of <title>; the template adds the suffix unless `titleAbsolute` is set. */
  title: string;
  /** True when `title` is already complete (home, about) and skips the template. */
  titleAbsolute?: boolean;
  /** 70 to 160 characters after resolution. A function only for config-derived copy. */
  description: string | (() => string);
  indexable: boolean | 'when-legal-reviewed';
  /** ISO date, edited by hand when content changes. Never in the future. */
  lastModified: string;
  /** Short label for breadcrumbs. Falls back to `title` when omitted. */
  breadcrumbLabel?: string;
  /** Breadcrumb parent: MUST be an existing registry path. */
  parent?: string;
  /** '/og/<card>' of this route's own card, or the nearest parent's. */
  ogImagePath: string;
}

/** Generated from the pricing config so the figure and VAT note can never drift. */
export function pricingDescription(config?: PricingConfig): string {
  return `Three monthly plans from ${buildCopyContext(config).displayPrice('starter', 'monthly')}, with included voice minutes and AI WhatsApp replies, clear overage and one-time setup fees.`;
}

export const routes: readonly RouteEntry[] = [
  {
    path: '/',
    title: 'IK Cloud Solutions | Cloud, DevOps and AI Agents',
    titleAbsolute: true,
    description:
      'Scotland-based cloud and DevOps consultancy. Multi-cloud, Kubernetes, FinOps and security services, plus managed AI receptionists for UK businesses.',
    indexable: true,
    lastModified: '2026-10-22',
    ogImagePath: '/og/home',
  },
  {
    path: '/services',
    title: 'Cloud, DevOps and FinOps Services',
    description:
      'Multi-cloud DevOps, GitOps, cloud migration, FinOps, DevSecOps and senior engineering support from a Glenrothes-based consultancy.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Services',
    parent: '/',
    ogImagePath: '/og/services',
  },
  {
    path: '/about',
    title: 'About | IK Cloud Solutions, Glenrothes',
    titleAbsolute: true,
    description:
      'IK Cloud Solutions is a founder-led cloud and DevOps consultancy in Glenrothes, Scotland. Meet Ikram Ullah and see how we work.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'About',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/contact',
    title: 'Contact IK Cloud Solutions',
    description:
      'Contact IK Cloud Solutions at 35 Napier Road, Glenrothes KY6 1DS, or send an enquiry about cloud, DevOps or AI agents.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Contact',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/ai-agents',
    title: 'AI Receptionist for Phone & WhatsApp',
    description:
      'We set up, run and improve an AI receptionist that answers your calls and WhatsApp messages. UK numbers, plain monthly pricing in GBP.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'AI Agents',
    parent: '/',
    ogImagePath: '/og/ai-agents',
  },
  {
    path: '/ai-agents/pricing',
    title: 'AI Front Desk Pricing in GBP',
    description: () => pricingDescription(),
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Pricing',
    parent: '/ai-agents',
    ogImagePath: '/og/ai-agents-pricing',
  },
  {
    path: '/ai-agents/voice',
    title: 'AI Voice Receptionist for UK Calls',
    description:
      'An AI voice receptionist on a UK number that answers, captures details, books and hands over. Always discloses it is an AI.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Voice',
    parent: '/ai-agents',
    ogImagePath: '/og/ai-agents',
  },
  {
    path: '/ai-agents/whatsapp',
    title: 'AI WhatsApp Assistant for Business',
    description:
      'An AI assistant for your business WhatsApp number that answers customers, captures enquiries and hands over to your team.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'WhatsApp',
    parent: '/ai-agents',
    ogImagePath: '/og/ai-agents',
  },
  {
    path: '/ai-agents/websites',
    title: 'AI Website Add-on with Hosting',
    description:
      'No website yet? Add a 3-5 page AI-built site with hosting and domain setup to go with your AI Front Desk.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Websites',
    parent: '/ai-agents',
    ogImagePath: '/og/ai-agents',
  },
  {
    path: '/ai-agents/done-for-you',
    title: 'Done-for-You AI Receptionist Setup',
    description:
      'We build, test and launch your AI Front Desk for you. See setup packages, the process and what we need from you.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Done-for-you',
    parent: '/ai-agents',
    ogImagePath: '/og/ai-agents',
  },
  {
    path: '/ai-agents/how-it-works',
    title: 'How the AI Front Desk Works',
    description:
      'How we set up, run and improve an AI receptionist for phone and WhatsApp, with guardrails, handover rules and UK compliance built in.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'How it works',
    parent: '/ai-agents',
    ogImagePath: '/og/ai-agents',
  },
  {
    path: '/ai-agents/for/clinics',
    title: 'AI Receptionist for UK Clinics',
    description:
      'An AI receptionist for private and dental clinics: appointment requests, opening-hours questions and safe handover. See an example.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Clinics',
    parent: '/ai-agents',
    ogImagePath: '/og/clinics',
  },
  {
    path: '/ai-agents/for/estate-agents',
    title: 'AI Receptionist for Estate Agents',
    description:
      'An AI receptionist for lettings and sales agents: viewing requests, enquiries and maintenance reports, including outside office hours.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Estate agents',
    parent: '/ai-agents',
    ogImagePath: '/og/estate-agents',
  },
  {
    path: '/ai-agents/for/home-services',
    title: 'AI Receptionist for Trades',
    description:
      'An AI receptionist for plumbers, electricians and heating engineers: capture job details and urgency when you are on site.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Home services',
    parent: '/ai-agents',
    ogImagePath: '/og/home-services',
  },
  {
    path: '/ai-agents/get-started',
    title: 'Request Your AI Front Desk',
    description:
      'Tell us about your business and we will come back with a plan, a quote and a launch timeline for your AI Front Desk.',
    indexable: true,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Get started',
    parent: '/ai-agents',
    ogImagePath: '/og/ai-agents',
  },
  {
    path: '/academy',
    title: 'IK Cloud Academy (Demo)',
    description:
      'A demo of IK Cloud Academy: sample Kubernetes, AWS, Terraform and DevSecOps lessons. Placeholder content, not a paid course.',
    indexable: false,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Academy',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/academy/studio',
    title: 'Academy Course Editor (Demo)',
    description:
      'A demo course editor for IK Cloud Academy. It runs only in your browser and nothing you create is saved on our servers.',
    indexable: false,
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Course editor',
    parent: '/academy',
    ogImagePath: '/og/default',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy (Draft)',
    description:
      'Draft privacy policy for IK Cloud Solutions: what personal information we collect, why, who we share it with and your UK GDPR rights.',
    indexable: 'when-legal-reviewed',
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Privacy',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/terms',
    title: 'Terms of Service (Draft)',
    description:
      'Draft terms of service outline for businesses ordering consultancy or the AI Front Desk from IK Cloud Solutions in Glenrothes, Scotland.',
    indexable: 'when-legal-reviewed',
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Terms',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/acceptable-use',
    title: 'Acceptable Use Policy (Draft)',
    description:
      'Draft acceptable use policy for the AI Front Desk: what is not allowed, what we require and what happens if the policy is broken.',
    indexable: 'when-legal-reviewed',
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Acceptable use',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/cookies',
    title: 'Cookies and Browser Storage (Draft)',
    description:
      'Every item this website stores in your browser or requests from a third party, and how to change or withdraw your cookie choice.',
    indexable: 'when-legal-reviewed',
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Cookies',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/refund-and-cancellation',
    title: 'Refunds and Cancellation (Draft)',
    description:
      'Draft refund and cancellation summary: monthly and annual plans, the 14-day window, setup fees and third-party costs.',
    indexable: 'when-legal-reviewed',
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Refunds and cancellation',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/security',
    title: 'Security Statement (Draft)',
    description:
      'What IK Cloud Solutions does today to protect this website, stated plainly, including the certifications we do not hold.',
    indexable: 'when-legal-reviewed',
    lastModified: '2026-10-22',
    breadcrumbLabel: 'Security',
    parent: '/',
    ogImagePath: '/og/default',
  },
  {
    path: '/dpa-summary',
    title: 'Data Processing Summary (Draft)',
    description:
      'Draft plain-English summary of how IK Cloud Solutions processes personal data for AI Front Desk customers, with planned subprocessors.',
    indexable: 'when-legal-reviewed',
    lastModified: '2026-10-22',
    breadcrumbLabel: 'DPA summary',
    parent: '/',
    ogImagePath: '/og/default',
  },
];

export function findRoute(path: string): RouteEntry | undefined {
  return routes.find((route) => route.path === path);
}

export function resolveDescription(entry: RouteEntry): string {
  return typeof entry.description === 'function' ? entry.description() : entry.description;
}

export function isIndexable(entry: RouteEntry): boolean {
  if (entry.indexable === 'when-legal-reviewed') return siteConfig.legalReviewed;
  return entry.indexable;
}
