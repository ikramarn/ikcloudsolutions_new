export const homeHero = {
  eyebrow: 'Glenrothes, Scotland',
  title: 'Build, modernise and scale multi-cloud with confidence.',
  lead: 'We work across AWS, Azure, GCP and Oracle Cloud: Kubernetes, ArgoCD GitOps, FinOps and agentic AI, from a Glenrothes-based consultancy.',
  // Neutral capability chips. Nothing here is a claim about results.
  chips: ['Terraform', 'Kubernetes', 'ArgoCD', 'FinOps', 'DevSecOps'],
  primaryCta: 'Request your AI Front Desk',
  secondaryCta: 'Book a consultation',
  academyLink: 'Try the Academy demo',
} as const;

export const architectureCard = {
  label: 'Illustrative example',
  heading: 'How a GitOps flow works',
  caption:
    'A simplified view of a GitOps workflow. It shows the idea, not a live system or a client environment.',
  nodes: [
    { id: 'git', title: 'Git repository', detail: 'Desired state is stored as code' },
    { id: 'argocd', title: 'ArgoCD', detail: 'Compares the repository with the cluster' },
    {
      id: 'cluster',
      title: 'Kubernetes cluster',
      detail: 'Changes are applied and drift is reported',
    },
  ],
} as const;

export const agentsTeaser = {
  heading: 'AI Front Desk for UK businesses',
  eyebrow: 'New',
  lead: 'An AI receptionist for your phone line and WhatsApp number. We set it up, run it and improve it every month.',
  bullets: [
    'Answers calls and WhatsApp messages, captures details and hands over to a person when it should',
    'One knowledge base for both channels, written from your own facts',
    'UK numbers, plain monthly pricing in GBP and a one-time setup fee',
  ],
  priceLead: 'Plans from',
} as const;

export const servicesSection = {
  heading: 'Cloud, DevOps and FinOps services',
  intro: 'Six areas of work, from delivery pipelines to cloud cost control.',
} as const;

export const finopsSection = {
  heading: 'Estimate a possible cloud saving',
  intro:
    'Choose a monthly cloud spend and the saving you want to test. The output is an illustration based on your own assumption.',
} as const;

export const academyBanner = {
  eyebrow: 'Demo',
  heading: 'IK Cloud Academy',
  body: 'A demonstration of how our training could look: sample Kubernetes, AWS, Terraform and DevSecOps lessons. The content is placeholder material and nothing there is a paid course.',
  cta: 'See the Academy demo',
} as const;

export const aboutTeaser = {
  heading: 'Founder-led, based in Glenrothes',
  body: 'IK Cloud Solutions is led by Ikram Ullah, working from Glenrothes in Fife, Scotland.',
  cta: 'About IK Cloud Solutions',
} as const;

export const homeCta = {
  heading: 'Tell us what you are working on',
  body: 'Send an enquiry about cloud, DevOps or AI agents and we will reply by email.',
  primary: 'Contact us',
  secondary: 'Book a consultation',
} as const;
