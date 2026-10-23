import { buildCopyContext } from '@/lib/copy/faq';

export const OG_CARD_IDS = [
  'default',
  'home',
  'services',
  'ai-agents',
  'ai-agents-pricing',
  'clinics',
  'estate-agents',
  'home-services',
] as const;
export type OgCardId = (typeof OG_CARD_IDS)[number];

export interface OgCard {
  title: string;
  /** A function only where the text comes from config (the pricing card). */
  tagline: string | (() => string);
}

export const ogCards: Record<OgCardId, OgCard> = {
  default: {
    title: 'Cloud, DevOps and AI agents',
    tagline: 'A Glenrothes-based consultancy for UK businesses.',
  },
  home: {
    title: 'Build, modernise and scale multi-cloud',
    tagline: 'Cloud and DevOps consultancy, plus managed AI receptionists.',
  },
  services: {
    title: 'Cloud, DevOps and FinOps services',
    tagline: 'GitOps, migration, FinOps, DevSecOps and senior engineers.',
  },
  'ai-agents': {
    title: 'AI Front Desk',
    tagline: 'An AI receptionist for your calls and WhatsApp messages.',
  },
  'ai-agents-pricing': {
    title: 'AI Front Desk pricing',
    // Figure and VAT wording come from the pricing config, never typed here.
    tagline: () => `Plans from ${buildCopyContext().displayPrice('starter', 'monthly')}.`,
  },
  clinics: {
    title: 'AI receptionist for UK clinics',
    tagline: 'Appointment requests and safe handover, day and night.',
  },
  'estate-agents': {
    title: 'AI receptionist for estate agents',
    tagline: 'Viewing requests and enquiries, including out of hours.',
  },
  'home-services': {
    title: 'AI receptionist for trades',
    tagline: 'Capture job details while you are on site.',
  },
};

export function isOgCardId(value: string): value is OgCardId {
  return (OG_CARD_IDS as readonly string[]).includes(value);
}

export function resolveOgTagline(card: OgCard): string {
  return typeof card.tagline === 'function' ? card.tagline() : card.tagline;
}
