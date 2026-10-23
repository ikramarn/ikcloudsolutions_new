import type { AgentPage } from '@/content/agents/sections';

export const websitesPage: AgentPage = {
  h1: 'No website yet? We can build one for your AI Front Desk',
  lead: 'A website is not required, but it gives your AI receptionist a source of facts and gives customers somewhere to find you. This optional add-on covers the site, hosting and domain.',
  sections: [
    {
      id: 'what-is-included',
      heading: 'What the site includes',
      features: [
        {
          title: 'Three to five pages',
          description: 'Home, services, about and contact, written from the facts you give us.',
        },
        {
          title: 'Hosting',
          description: 'We host the site and keep it online.',
        },
        {
          title: 'Updates on request',
          description: 'Ask us for changes and we make them.',
        },
      ],
    },
    {
      id: 'domain',
      heading: 'Your domain',
      intro:
        'We can register and connect a domain for you. You own the registration, so you can take it elsewhere at any time.',
      note: 'The registry price varies by extension and is paid at cost on top of our handling fee.',
    },
    {
      id: 'how-it-links',
      heading: 'How it fits with the AI Front Desk',
      bullets: [
        'The site and the agent share one set of approved facts',
        'The agent can point customers to the right page',
        'You can add the site at any time, not only at the start',
      ],
    },
  ],
};
