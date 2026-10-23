import type { AgentFeature } from '@/content/agents/sections';

export const doneForYouPage = {
  h1: 'Done-for-you AI Front Desk setup',
  lead: 'We build, test and launch your AI Front Desk for you. See the setup packages, the process and what we need from you.',
  packagesHeading: 'Setup packages',
  packagesIntro:
    'A one-time fee. Timelines are indicative and depend on how quickly we receive what we need.',
  timelineHeading: 'The process',
  timeline: [
    {
      title: 'Intake',
      description: 'You tell us about your business using the short form.',
    },
    {
      title: 'Draft agent',
      description: 'We write the first version of the agent and its knowledge base.',
    },
    {
      title: 'Internal review',
      description: 'We check it against your facts and handover rules.',
    },
    {
      title: 'Test script',
      description: 'We agree the situations to test, including the awkward ones.',
    },
    {
      title: 'Your test call and WhatsApp',
      description: 'You try it yourself on the phone and in WhatsApp and tell us what to change.',
    },
    {
      title: 'Go-live',
      description: 'We switch the number and channel on once you are happy.',
    },
    {
      title: 'Tuning period',
      description: 'We review early conversations closely and adjust the agent.',
    },
    {
      title: 'Handover',
      description:
        'We walk you through the summaries, the monthly review and how to ask for changes.',
    },
  ] satisfies readonly AgentFeature[],
  checklistHeading: 'What we need from you',
  checklist: [
    'Your legal name and address',
    'Opening hours and holidays',
    'Your services and any prices you want the agent to share',
    'Booking rules',
    'Who to alert for urgent matters',
    'The tone of voice you prefer',
    'About thirty common questions customers ask',
    'Topics the agent must never discuss',
    'Calendar access, if you want bookings',
  ],
  selfServeNote:
    'Self-serve set-up is planned and will arrive with our customer app. Until then, set-up is done for you.',
} as const;
