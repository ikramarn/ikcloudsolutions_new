import type { AgentFeature } from '@/content/agents/sections';

export const overviewContent = {
  h1: 'We set up, run and improve your AI receptionist for phone and WhatsApp',
  lead: 'Answer every call and message, capture the details, book where you can and hand over to a person when it matters. We build it, host it and tune it every month.',
  badge: 'Now taking early customers',
  primaryCta: 'Request your AI Front Desk',
  secondaryCta: 'See pricing',
  value: {
    heading: 'What it does for you',
    features: [
      {
        title: 'Answers every call and message',
        description:
          'Callers and customers get a reply straight away, including when your team is busy or the office is closed.',
      },
      {
        title: 'Captures the details',
        description:
          'Names, numbers, reasons and preferred times are collected and sent to you as a short summary.',
      },
      {
        title: 'Books and hands over',
        description:
          'It offers slots from your calendar where connected, and passes complaints and urgent matters to a person.',
      },
      {
        title: 'One knowledge base for both channels',
        description:
          'Phone and WhatsApp draw on the same approved facts, so customers get the same answer on either.',
      },
      {
        title: 'We operate it',
        description:
          'Hosting, monitoring and monthly improvements are handled by us, so you do not manage a tool.',
      },
    ] satisfies readonly AgentFeature[],
  },
  steps: {
    heading: 'How it works',
    items: [
      {
        title: 'Tell us about your business',
        description: 'Share your services, hours and handover rules in a short form.',
      },
      {
        title: 'We build, test and launch it',
        description:
          'We write the agent, connect your calendar, test it with you on the phone and WhatsApp, then go live.',
      },
      {
        title: 'We monitor and improve it monthly',
        description: 'Each month we review conversations, fix gaps and adjust the handover rules.',
      },
    ] satisfies readonly AgentFeature[],
  },
  channels: {
    heading: 'Two channels, one agent',
    voice: {
      title: 'AI voice receptionist',
      description:
        'Answers calls on a UK number, says it is an AI, captures details and hands over to a person.',
      href: '/ai-agents/voice',
    },
    whatsapp: {
      title: 'AI WhatsApp assistant',
      description:
        'Replies to customers who message your business WhatsApp number, within the 24-hour window.',
      href: '/ai-agents/whatsapp',
    },
  },
  whatYouGet: {
    heading: 'What you get',
    items: [
      'Set-up of the agent, written from your own facts',
      'Hosting and monitoring',
      'A monthly review and improvements',
      'UK numbers, new or forwarded',
      'Handover to a person using rules you set',
      'A summary of each conversation by email',
      'A person to talk to when something needs changing',
    ],
  },
  industries: {
    heading: 'Built around your industry',
    intro: 'Each starting template covers the questions that sector hears every day.',
  },
  addons: {
    heading: 'Add-ons when you need them',
    intro:
      'A website if you have none, extra numbers, WhatsApp verification help and written knowledge bases. Prices are on the pricing page.',
  },
  pricing: {
    heading: 'Plain monthly pricing',
    intro: 'Three plans in GBP. Voice minutes and AI WhatsApp replies are counted separately.',
  },
  limits: {
    heading: 'What it does not do',
    items: [
      'It does not make outbound calls at launch',
      'It is not an emergency service and must not be relied on for emergencies',
      'It does not give clinical, legal or financial advice',
      'It works in English first',
    ],
  },
  faqHeading: 'Questions we are asked',
  cta: {
    heading: 'Ready to see it with your business details?',
    body: 'Tell us about your business and we will come back with a plan, a quote and a launch timeline.',
  },
} as const;
