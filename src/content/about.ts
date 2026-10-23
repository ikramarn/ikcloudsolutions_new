import { siteConfig } from '@/config/site';

export const aboutContent = {
  title: 'About IK Cloud Solutions',
  lead: 'A founder-led cloud and DevOps consultancy in Glenrothes, Scotland.',
  mission: {
    heading: 'Mission',
    body: 'To give engineering teams clear priorities, automated delivery and sensible cloud choices, so they can ship reliably and spend with intent.',
  },
  vision: {
    heading: 'Vision',
    body: 'Cloud computing, agentic AI and DevOps automation working together as a dependable base for growth.',
  },
  founder: {
    heading: siteConfig.founder.name,
    role: siteConfig.founder.role,
    imageAlt: `${siteConfig.founder.name}, founder of ${siteConfig.name}`,
    bio: 'Ikram Ullah founded IK Cloud Solutions. His work covers multi-cloud infrastructure, Kubernetes, Terraform, FinOps and GitOps with ArgoCD.',
    specialties: ['Multi-Cloud DevOps', 'Kubernetes', 'Terraform', 'FinOps', 'GitOps with ArgoCD'],
  },
  addressHeading: 'Where we are',
  contactCta: 'Get in touch',
} as const;
