import type { Route } from 'next';
import { asRoute } from '@/config/links';

export interface NavLink {
  label: string;
  href: Route;
  description?: string;
  badge?: 'NEW' | 'DEMO';
}

export interface NavGroup {
  heading: string;
  links: readonly NavLink[];
}

export interface NavItem {
  label: string;
  href?: Route;
  badge?: 'NEW' | 'DEMO';
  groups?: readonly NavGroup[];
}

export interface FooterColumn {
  heading: string;
  links: readonly NavLink[];
}

export const HEADER_CTA_LABEL = 'Request your AI Front Desk';

const link = (label: string, href: string, description?: string): NavLink => ({
  label,
  href: asRoute(href),
  ...(description ? { description } : {}),
});

export const aiFrontDeskLinks: readonly NavLink[] = [
  link('Overview', '/ai-agents', 'What the AI Front Desk is'),
  link('Voice', '/ai-agents/voice', 'An AI receptionist for your calls'),
  link('WhatsApp', '/ai-agents/whatsapp', 'An AI assistant for your WhatsApp number'),
  link('Websites', '/ai-agents/websites', 'A website and hosting add-on'),
  link('Done-for-you', '/ai-agents/done-for-you', 'We set it up for you'),
  link('How it works', '/ai-agents/how-it-works', 'Set-up, handover and guardrails'),
  link('Pricing', '/ai-agents/pricing', 'Plans in GBP'),
];

const industryLinks: readonly NavLink[] = [
  link('Clinics', '/ai-agents/for/clinics'),
  link('Estate agents', '/ai-agents/for/estate-agents'),
  link('Home services', '/ai-agents/for/home-services'),
];

export const headerItems: readonly NavItem[] = [
  { label: 'Services', href: asRoute('/services') },
  {
    label: 'AI Agents',
    href: asRoute('/ai-agents'),
    badge: 'NEW',
    groups: [
      { heading: 'AI Front Desk', links: aiFrontDeskLinks },
      { heading: 'By industry', links: industryLinks },
    ],
  },
  { label: 'Academy', href: asRoute('/academy'), badge: 'DEMO' },
  { label: 'About', href: asRoute('/about') },
  { label: 'Contact', href: asRoute('/contact') },
];

export const footerColumns: readonly FooterColumn[] = [
  {
    heading: 'Services',
    links: [
      link('Multi-cloud DevOps and GitOps', '/services#devops-gitops'),
      link('Agentic AI and engineering', '/services#agentic-ai'),
      link('Cloud migration', '/services#cloud-migration'),
      link('FinOps and cost optimisation', '/services#finops'),
      link('DevSecOps', '/services#devsecops'),
      link('Cloud squads', '/services#cloud-squads'),
    ],
  },
  { heading: 'AI Front Desk', links: aiFrontDeskLinks },
  {
    heading: 'Company',
    links: [
      link('About', '/about'),
      link('Contact', '/contact'),
      link('Academy (demo)', '/academy'),
    ],
  },
  {
    heading: 'Legal',
    links: [
      link('Privacy', '/privacy'),
      link('Terms', '/terms'),
      link('Acceptable use', '/acceptable-use'),
      link('Cookies', '/cookies'),
      link('Refunds and cancellation', '/refund-and-cancellation'),
      link('Security', '/security'),
      link('DPA summary', '/dpa-summary'),
    ],
  },
];
