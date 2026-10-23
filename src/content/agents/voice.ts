import type { AgentPage } from '@/content/agents/sections';

export const voicePage: AgentPage = {
  h1: 'AI voice receptionist for UK businesses',
  lead: 'An AI assistant answers calls on a UK number, takes the details and hands over to your team when it should. It tells every caller it is an AI.',
  sections: [
    {
      id: 'on-a-call',
      heading: 'What it does on a call',
      features: [
        {
          title: 'Greets and discloses',
          description:
            'It answers, says it is an AI assistant and tells the caller if the call is recorded.',
        },
        {
          title: 'Answers from your facts',
          description:
            'Opening hours, services and simple questions come from the knowledge base you approve. If it does not know, it says so.',
        },
        {
          title: 'Captures and books',
          description:
            'It takes names, numbers and reasons, and offers slots from a connected calendar where you want that.',
        },
        {
          title: 'Hands over',
          description:
            'Complaints, urgent matters and anyone who asks for a person are passed on using your rules.',
        },
      ],
    },
    {
      id: 'uk-numbers',
      heading: 'UK numbers',
      intro: 'You can have a new UK number, or forward the number you already use.',
      bullets: [
        'A new UK number routed to your agent',
        'Forward your existing number to it',
        'Moving (porting) an existing number is possible in some cases and quoted separately',
      ],
    },
    {
      id: 'data-captured',
      heading: 'What it captures',
      bullets: [
        'Caller name and phone number',
        'The reason for the call',
        'Preferred time or callback window',
        'Anything else you ask it to collect, such as a postcode',
      ],
      note: 'You receive a short summary of each call by email.',
    },
    {
      id: 'limits',
      heading: 'Limits',
      bullets: [
        'It is not an emergency service and must not be relied on for emergencies',
        'It does not give clinical, legal or financial advice',
        'It does not make outbound calls at launch',
        'It works in English first',
      ],
    },
  ],
};

export const voiceDemo = {
  heading: 'Hear how a call can go',
  intro:
    'This is a scripted simulation with a fictional business. It plays no audio and no real call is placed.',
} as const;
