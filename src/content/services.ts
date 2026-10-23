import {
  Boxes,
  Cloud,
  Cpu,
  ShieldCheck,
  TrendingDown,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';

export type ServiceAccent = 'cyan' | 'violet' | 'blue' | 'emerald' | 'rose' | 'amber';

export interface Service {
  readonly id: string;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: ServiceAccent;
  readonly highlights: readonly string[];
}

// Ported from the old site with every metric line removed. Highlights describe what the work
// involves, not outcomes we cannot evidence.
export const services: readonly Service[] = [
  {
    id: 'devops-gitops',
    title: 'Multi-cloud DevOps and GitOps automation',
    tagline: 'Repeatable delivery across AWS, Azure, GCP and Oracle Cloud',
    description:
      'Automate infrastructure and container delivery with Terraform, ArgoCD GitOps and production-grade Kubernetes.',
    icon: Boxes,
    accent: 'cyan',
    highlights: [
      'ArgoCD declarative GitOps workflows with rollback',
      'Terraform modules for infrastructure as code',
      'Kubernetes on EKS, AKS and GKE with autoscaling',
      'Pipeline security checks with tools such as Trivy, SonarQube and Cosign',
    ],
  },
  {
    id: 'agentic-ai',
    title: 'Agentic AI and digital engineering',
    tagline: 'AI agents and cloud applications built to be maintained',
    description:
      'Design and build AI agents, retrieval pipelines and cloud-native applications, with monitoring and clear limits on what an agent may do.',
    icon: Cpu,
    accent: 'violet',
    highlights: [
      'AI agents for cloud monitoring and remediation tasks',
      'Vector database and retrieval (RAG) pipelines',
      'Full-stack web and mobile application engineering',
      'Event-driven streaming with Apache Kafka',
    ],
  },
  {
    id: 'cloud-migration',
    title: 'Cloud migration and architecture modernisation',
    tagline: 'Planned moves from legacy workloads to cloud-native designs',
    description:
      'Move legacy workloads to resilient, elastic architectures using containers, serverless components and hybrid connectivity where it fits.',
    icon: Cloud,
    accent: 'blue',
    highlights: [
      'Well-Architected Framework reviews for AWS, Azure and GCP',
      'Migration planning for databases and containerised workloads',
      'Disaster recovery and multi-region design',
      'Service decomposition guided by domain-driven design',
    ],
  },
  {
    id: 'finops',
    title: 'FinOps and cloud cost optimisation',
    tagline: 'Understand your cloud bill, then bring it under control',
    description:
      'Get visibility of cloud spend and act on it with rightsizing, commitment planning and clear ownership of cost.',
    icon: TrendingDown,
    accent: 'emerald',
    highlights: [
      'Rightsizing compute and removing idle resources',
      'Reserved instance and savings plan review',
      'Kubernetes cost allocation with tools such as Kubecost',
      'Budget dashboards and threshold alerts',
    ],
  },
  {
    id: 'devsecops',
    title: 'DevSecOps and cloud governance',
    tagline: 'Security checks built into the delivery pipeline',
    description:
      'Shift security left with automated scanning, policy-as-code, secrets management and least-privilege access.',
    icon: ShieldCheck,
    accent: 'rose',
    highlights: [
      'Container vulnerability scanning that can block a pull request',
      'Least-privilege IAM roles and short-lived credentials',
      'Evidence collection and policy-as-code to support frameworks such as ISO 27001 and SOC 2',
      'Secrets lifecycle with HashiCorp Vault and cloud key management',
    ],
  },
  {
    id: 'cloud-squads',
    title: 'Cloud squads and senior engineering support',
    tagline: 'Experienced engineers alongside your own team',
    description:
      'Extend your team with senior DevOps engineers, Kubernetes specialists and cloud architects on flexible B2B contracts.',
    icon: UserCheck,
    accent: 'amber',
    highlights: [
      'Senior cloud architects, DevOps and SRE engineers',
      'Project-based work or team extension',
      'Onboarding agreed up front',
      'Knowledge transfer to your team as part of the work',
    ],
  },
];

export const servicesPage = {
  title: 'Cloud, DevOps and FinOps services',
  lead: 'Six areas of consultancy work from a Glenrothes-based consultancy, plus a managed AI receptionist for UK businesses.',
  frontDeskCard: {
    heading: 'AI Front Desk',
    body: 'A managed AI receptionist that answers calls and WhatsApp messages for UK businesses. We set it up, run it and improve it.',
  },
  estimatorHeading: 'Estimate a possible cloud saving',
} as const;
