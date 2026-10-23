import type { AgentPage } from '@/content/agents/sections';

export const howItWorksPage: AgentPage = {
  h1: 'How the AI Front Desk works',
  lead: 'We set up, run and improve an AI receptionist for phone and WhatsApp, with guardrails, handover rules and UK compliance built in.',
  sections: [
    {
      id: 'three-steps',
      heading: 'Three steps in depth',
      steps: [
        {
          title: 'Tell us about your business',
          description:
            'You share your services, hours, booking rules and the questions customers ask. We use that, not guesses, to write the agent.',
        },
        {
          title: 'We build, test and launch it',
          description:
            'We write the agent, connect your calendar and alerts, test the awkward situations and let you try it before it goes live.',
        },
        {
          title: 'We monitor and improve it',
          description:
            'Each month we review conversations, update the knowledge base and tune the handover rules.',
        },
      ],
    },
    {
      id: 'one-brain',
      heading: 'One agent, one knowledge base',
      intro:
        'The phone assistant and the WhatsApp assistant read from the same approved facts, so a customer gets the same answer on either channel.',
    },
    {
      id: 'guardrails',
      heading: 'Guardrails',
      bullets: [
        'It answers only from facts you have approved',
        'It says when it does not know and offers a callback',
        'It hands over complaints and urgent matters',
        'It refuses requests that are off-topic or outside its remit',
      ],
    },
    {
      id: 'compliance',
      heading: 'Compliance by default',
      bullets: [
        'The assistant discloses that it is an AI at the start of every call',
        'Callers are told if a call is recorded',
        'Our role and yours under UK GDPR are set out in the {{link:/dpa-summary|data processing summary}}, currently a draft',
      ],
    },
    {
      id: 'monitoring',
      heading: 'Monitoring and monthly improvement',
      intro:
        'We watch for failed conversations and gaps in the knowledge base, and review them with you each month.',
    },
  ],
};
