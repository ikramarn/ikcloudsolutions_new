import type { FaqItem } from '@/lib/copy/faq';

export const INDUSTRY_SLUGS = ['clinics', 'estate-agents', 'home-services'] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export interface Industry {
  readonly slug: IndustrySlug;
  readonly name: string;
  /** Short label for cards and breadcrumbs. */
  readonly cardTitle: string;
  readonly h1: string;
  readonly intro: string;
  readonly pains: readonly string[];
  readonly handles: readonly string[];
  readonly neverDoes: readonly string[];
  readonly escalates: readonly string[];
  readonly captures: readonly string[];
  readonly template: {
    readonly name: string;
    readonly summary: string;
    readonly integrations: readonly string[];
  };
  /** Both required: each industry has one scripted voice and one scripted WhatsApp demo. */
  readonly demoScriptIds: { readonly voice: string; readonly whatsapp: string };
  readonly faq: readonly FaqItem[];
}

// Exactly three industries (amendment A4). Adding a fourth needs two new scripted demos.
export const industries: readonly Industry[] = [
  {
    slug: 'clinics',
    name: 'Clinics',
    cardTitle: 'Private and dental clinics',
    h1: 'An AI receptionist for private and dental clinics',
    intro:
      'Reception teams are often with a patient when the phone rings. The AI Front Desk answers, takes appointment requests and passes anything clinical to your team.',
    pains: [
      'Calls missed while the front desk is with a patient',
      'Opening-hours and booking questions that interrupt busy staff',
      'Messages left after closing that nobody sees until morning',
    ],
    handles: [
      'Appointment requests, including new or existing patient',
      'Opening hours, location and parking questions from your approved facts',
      'Taking a name, mobile number and preferred time for your team to confirm',
      'Cancellation and rescheduling requests, passed on to the practice',
    ],
    neverDoes: [
      'Diagnose, or give medical or dental advice',
      'Advise on medication',
      'Access or discuss clinical records',
      'Promise an appointment that your team has not confirmed',
    ],
    escalates: [
      'Anything that sounds like an emergency, with a pointer to NHS 111 or 999',
      'Complaints',
      'Any clinical question',
      'Callers who ask for a person',
    ],
    captures: [
      'Name and contact details',
      'Reason for the visit, as a category',
      'Preferred time',
      'New or existing patient',
    ],
    template: {
      name: 'Clinic reception template',
      summary:
        'Starts from a clinic-specific set of prompts covering appointment requests, opening hours and safe handover. We replace the placeholders with your own facts.',
      integrations: [
        'Appointment calendar',
        'Email summaries',
        'Practice management software (where an integration is available)',
      ],
    },
    demoScriptIds: { voice: 'clinics-voice', whatsapp: 'clinics-whatsapp' },
    faq: [
      {
        id: 'clinical-advice',
        question: 'Will the AI give clinical advice?',
        answer:
          'No. It does not diagnose or advise on treatment or medication. If someone describes an emergency it points them to NHS 111 or 999 and flags your on-call contact.',
      },
      {
        id: 'patient-records',
        question: 'Does it see patient records?',
        answer:
          'No. It works from the facts you approve and the details the caller gives. Connecting it to clinical records is not part of the standard set-up.',
      },
      {
        id: 'bookings',
        question: 'Does it book appointments by itself?',
        answer:
          'It can offer slots from a connected calendar and take the request. Your team confirms. We agree the booking rules with you during set-up.',
      },
      {
        id: 'clinic-cost',
        question: 'How much does it cost for a clinic?',
        answer: (c) =>
          `The same plans apply to every industry. Plans start from ${c.displayPrice('starter', 'monthly')}. See {{link:/ai-agents/pricing|the pricing page}} for the full breakdown.`,
      },
    ],
  },
  {
    slug: 'estate-agents',
    name: 'Estate agents',
    cardTitle: 'Lettings and sales agents',
    h1: 'An AI receptionist for lettings and sales agents',
    intro:
      'Viewing requests, tenant reports and enquiries arrive at all hours. The AI Front Desk answers each one, captures the details and routes it to the right person.',
    pains: [
      'Enquiries that arrive in the evening or at weekends',
      'Maintenance reports that need to reach the right contractor quickly',
      'Negotiators interrupted during viewings',
    ],
    handles: [
      'Enquiries about a listing, using the status in your listing feed',
      'Viewing requests, offering the slots you allow',
      'Capturing budget, move date and whether the caller is a landlord or tenant',
      'Maintenance reports, logged and routed to your maintenance contact',
    ],
    neverDoes: [
      'Negotiate on price',
      'Give a valuation or pricing advice',
      'Promise availability that is not in the listing feed',
      'Handle offers or contracts',
    ],
    escalates: [
      'Urgent maintenance such as no heating or a suspected gas leak',
      'Offers and negotiation',
      'Complaints',
      'Callers who ask for a person',
    ],
    captures: [
      'Name, phone and email',
      'Budget and move date',
      'Landlord or tenant',
      'Property reference and the issue for maintenance reports',
    ],
    template: {
      name: 'Lettings and sales template',
      summary:
        'Starts from prompts for listing enquiries, viewing requests and maintenance reports. We connect your listing feed and set your rules for out-of-hours reports.',
      integrations: [
        'Listing feed',
        'Viewing calendar',
        'Maintenance contact routing',
        'Email summaries',
      ],
    },
    demoScriptIds: { voice: 'estate-agents-voice', whatsapp: 'estate-agents-whatsapp' },
    faq: [
      {
        id: 'valuations',
        question: 'Can the AI value a property?',
        answer:
          'No. It cannot give valuations or pricing advice. It can book a valuation visit with one of your negotiators.',
      },
      {
        id: 'listing-feed',
        question: 'Where does it get property details from?',
        answer:
          'From the listing feed or fact sheet you approve. If it is not in there, the AI says it does not know and offers a callback.',
      },
      {
        id: 'out-of-hours',
        question: 'What happens to maintenance reports out of hours?',
        answer:
          'It logs the issue, tells the tenant what happens next and passes it to the contact you choose. For a suspected gas leak it directs the caller to the National Gas Emergency Service.',
      },
      {
        id: 'agent-cost',
        question: 'How much does it cost for an agency?',
        answer: (c) =>
          `The same plans apply to every industry. Plans start from ${c.displayPrice('starter', 'monthly')}. See {{link:/ai-agents/pricing|the pricing page}} for the full breakdown.`,
      },
    ],
  },
  {
    slug: 'home-services',
    name: 'Home services',
    cardTitle: 'Plumbers, electricians and heating engineers',
    h1: 'An AI receptionist for plumbers, electricians and heating engineers',
    intro:
      'When you are on a job you cannot answer the phone. The AI Front Desk takes the details, notes how urgent it is and puts the job on your list.',
    pains: [
      'Missed calls while you are under a sink or on a roof',
      'Jobs lost to the next firm that picks up',
      'Messages with no address, postcode or urgency',
    ],
    handles: [
      'Capturing the address, postcode, the problem and how urgent it is',
      'Noting access details and a preferred time',
      'Adding quote requests to a callback list',
      'Answering simple questions from your approved facts, such as areas covered',
    ],
    neverDoes: [
      'Quote fixed prices that are not on your approved list',
      'Give safety instructions beyond directing the caller to emergency services',
      'Promise a time of arrival you have not agreed',
      'Diagnose faults',
    ],
    escalates: [
      'A suspected gas leak: the caller is told to leave the property and call the National Gas Emergency Service on 0800 111 999 first, then you are flagged',
      'Anything involving vulnerable people at home',
      'Complaints',
      'Callers who ask for a person',
    ],
    captures: [
      'Name and phone number',
      'Address and postcode',
      'The problem and its urgency',
      'Access notes and preferred time',
    ],
    template: {
      name: 'Trades job-intake template',
      summary:
        'Starts from prompts for job intake, urgency and quote callbacks. We add your areas covered, your services and who to alert for urgent jobs.',
      integrations: ['Callback list', 'Email or message alerts', 'Calendar (optional)'],
    },
    demoScriptIds: { voice: 'home-services-voice', whatsapp: 'home-services-whatsapp' },
    faq: [
      {
        id: 'gas-smell',
        question: 'What does the AI do if someone smells gas?',
        answer:
          'It tells the caller to leave the property and call the National Gas Emergency Service on 0800 111 999 before anything else, then flags you. It gives no other safety instructions.',
      },
      {
        id: 'quotes',
        question: 'Can it quote a price?',
        answer:
          'Only from a price list you approve. Otherwise it adds the caller to a quote callback list and your team follows up.',
      },
      {
        id: 'on-site',
        question: 'Can I use it while I am on site?',
        answer:
          'Yes. That is the point: it takes the call, captures the job details and sends you a summary to read when you are free.',
      },
      {
        id: 'trades-cost',
        question: 'How much does it cost for a trade business?',
        answer: (c) =>
          `The same plans apply to every industry. Plans start from ${c.displayPrice('starter', 'monthly')}. See {{link:/ai-agents/pricing|the pricing page}} for the full breakdown.`,
      },
    ],
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
