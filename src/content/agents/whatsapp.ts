import type { AgentPage } from '@/content/agents/sections';

export const whatsappPage: AgentPage = {
  h1: 'AI WhatsApp assistant for your business',
  lead: 'An AI assistant replies to customers who message your business WhatsApp number, captures the details and hands over to your team when it should.',
  sections: [
    {
      id: 'scope',
      heading: 'What it is for',
      intro:
        'It replies to your own customers when they message you. It is not for sending marketing.',
      features: [
        {
          title: 'Answers enquiries',
          description:
            'Opening hours, services and simple questions, answered from the facts you approve.',
        },
        {
          title: 'Captures details',
          description:
            'Names, contact details and what the customer needs, sent to you as a summary.',
        },
        {
          title: 'Books where connected',
          description: 'It can offer slots from a calendar you connect, and your team confirms.',
        },
        {
          title: 'Hands over',
          description: 'Complaints and urgent matters are passed to a person using your rules.',
        },
      ],
    },
    {
      id: 'service-window',
      heading: 'The 24-hour service window',
      intro:
        'WhatsApp lets a business reply freely for 24 hours after the customer last messaged. After that, only approved template messages can be sent.',
      bullets: [
        'Inside the window the assistant can have a normal conversation',
        'Outside it, we use template messages that Meta has approved',
        'We set up the templates you need as part of the build',
      ],
    },
    {
      id: 'meta-verification',
      heading: 'Meta business verification',
      intro:
        'Meta asks businesses to verify before some WhatsApp features are available. We can help you complete the process.',
      note: 'Meta decides the outcome and it can take days to weeks. We cannot speed it up.',
    },
    {
      id: 'limits',
      heading: 'Limits',
      bullets: [
        'It is not an emergency service and must not be relied on for emergencies',
        'It does not give clinical, legal or financial advice',
        'It does not start conversations with people who have not messaged you',
        'It works in English first',
      ],
    },
  ],
};

export const whatsappDemo = {
  heading: 'See how a conversation can go',
  intro:
    'This is a scripted simulation with a fictional business. Choose a suggested example once it ends. No message is sent.',
} as const;
