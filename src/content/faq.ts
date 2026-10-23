import type { FaqItem } from '@/lib/copy/faq';

// FAQ items reused across several AI Front Desk pages. Answers that mention money use the copy
// context, so nothing here is a typed price, allowance or VAT phrase.
export const sharedFaq = {
  aiDisclosure: {
    id: 'ai-disclosure',
    question: 'Will callers know they are talking to an AI?',
    answer:
      'Yes. The assistant says it is an AI at the start of every call, and tells callers if the call is recorded.',
  },
  emergencies: {
    id: 'emergencies',
    question: 'Is it suitable for emergencies?',
    answer:
      'No. It is not an emergency service. If a caller describes an emergency it points them to 999 or the right emergency service and flags your team. Never rely on it to handle urgent situations.',
  },
  handover: {
    id: 'handover',
    question: 'What happens when the AI cannot help?',
    answer:
      'It says so, takes the caller details and hands over to a person using the rules we agree with you, for example a callback, an email summary or an urgent alert.',
  },
  website: {
    id: 'website',
    question: 'Do I need a website?',
    answer:
      'No. We use facts you give us, such as a document or your answers during set-up. If you have no website, we can build a small one as an optional add-on. See {{link:/ai-agents/websites|the website add-on}}.',
  },
  metaFees: {
    id: 'meta-fees',
    question: 'Who pays WhatsApp message fees?',
    answer:
      'WhatsApp message fees are charged by Meta, not by us. You add your own payment method to your WhatsApp Business account and Meta bills you directly. Rates vary by country and message category and change over time, so we do not quote them here.',
  },
  ukNumber: {
    id: 'uk-number',
    question: 'Can I keep my existing phone number?',
    answer:
      'You can forward your existing number to a new UK number we set up. Moving (porting) your number to us is possible in some cases and is quoted separately.',
  },
} as const satisfies Record<string, FaqItem>;
