// Initial Mock Data for IK Cloud Solutions & IK Cloud Academy

export const INITIAL_SERVICES = [
  {
    id: "devops-gitops",
    title: "Multi-Cloud DevOps & GitOps Automation",
    tagline: "Enterprise Continuous Delivery with Zero Configuration Drift",
    description: "Automate multi-cloud infrastructure and container orchestration across AWS, Azure, GCP, and Oracle Cloud using Terraform IaC, ArgoCD GitOps, and production-grade Kubernetes.",
    icon: "Boxes",
    color: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.4)",
    highlights: [
      "ArgoCD declarative GitOps workflows with automated rollback",
      "Terraform modular Infrastructure-as-Code across 4 cloud providers",
      "Multi-tenant Kubernetes (EKS, AKS, GKE) with automated scaling",
      "Automated DevSecOps pipeline gates (Trivy, SonarQube, Cosign)"
    ],
    metrics: "70% Faster Deployments · Zero Drift · 99.999% SLA"
  },
  {
    id: "agentic-ai",
    title: "Agentic AI & Digital Engineering",
    tagline: "Autonomous Enterprise Agents & Next-Gen Cloud Applications",
    description: "Build, modernize, and scale intelligent services with autonomous agentic architectures, predictive analytics, and automated self-healing cloud microservices.",
    icon: "Cpu",
    color: "from-purple-500 to-indigo-600",
    glowColor: "rgba(139, 92, 246, 0.4)",
    highlights: [
      "Autonomous AI agents for cloud remediation and monitoring",
      "Vector database pipelines & high-throughput RAG systems",
      "Modern full-stack web and mobile application engineering",
      "Real-time event-driven streaming with Apache Kafka"
    ],
    metrics: "3.5x Faster Workflows · 99.2% Prediction Accuracy"
  },
  {
    id: "cloud-architecture",
    title: "Cloud Migration & Architecture Modernization",
    tagline: "Future-Proof Zero-Downtime Enterprise Cloud Migration",
    description: "Transform legacy monolithic workloads into resilient, elastic cloud-native architectures with microservices, serverless components, and hybrid connectivity.",
    icon: "Cloud",
    color: "from-blue-500 to-cyan-400",
    glowColor: "rgba(59, 130, 246, 0.4)",
    highlights: [
      "Well-Architected Framework reviews for AWS, Azure & GCP",
      "Zero-downtime database and containerized workload migration",
      "Resilient disaster recovery & multi-region high availability",
      "Microservice decomposition using Domain-Driven Design"
    ],
    metrics: "Zero Data Loss · 45-day Avg Migration Horizon"
  },
  {
    id: "finops-optimization",
    title: "FinOps & Cloud Cost Optimization",
    tagline: "Radical Cloud Bill Reduction with Complete Governance",
    description: "Take control of exponential cloud spend with automated rightsizing, spot instance automation, reservation governance, and FinOps cultural alignment.",
    icon: "TrendingDown",
    color: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.4)",
    highlights: [
      "Automated compute rightsizing & idle resource termination",
      "Reserved Instance (RI) and Savings Plan portfolio optimization",
      "Kubernetes pod-level cost allocation using Kubecost",
      "Custom FinOps dashboards with real-time budget threshold alerts"
    ],
    metrics: "35% - 50% Cloud Spend Reduction in 60 Days"
  },
  {
    id: "devsecops-governance",
    title: "DevSecOps, Zero Trust & Cloud Governance",
    tagline: "Military-Grade Cloud Security Embedded in Every Commit",
    description: "Shift security left by integrating automated vulnerability scanning, policy-as-code with OPA/Kyverno, secrets management, and Zero Trust cloud networking.",
    icon: "ShieldCheck",
    color: "from-rose-500 to-orange-500",
    glowColor: "rgba(244, 63, 94, 0.4)",
    highlights: [
      "Container vulnerability scanning with automated PR blocking",
      "Zero Trust IAM role minimization & short-lived credentials",
      "Automated compliance auditing (SOC2, ISO27001, HIPAA, GDPR)",
      "HashiCorp Vault & AWS KMS secrets lifecycle automation"
    ],
    metrics: "100% Policy-as-Code · Zero Unencrypted Artifacts"
  },
  {
    id: "staff-augmentation",
    title: "B2B Enterprise Contracts & Cloud Squads",
    tagline: "Instant Augmentation with Battle-Tested Senior Cloud Engineers",
    description: "Augment your internal teams with vetted senior DevOps engineers, Kubernetes specialists, and cloud architects via flexible B2B contracts.",
    icon: "UserCheck",
    color: "from-amber-500 to-yellow-600",
    glowColor: "rgba(245, 158, 11, 0.4)",
    highlights: [
      "Dedicated Senior Cloud Architects, DevOps & SRE engineers",
      "Flexible engagement models: project-based or team extension",
      "Rapid onboarding: engineers start delivering sprint 1",
      "Continuous knowledge transfer & cloud competency upskilling"
    ],
    metrics: "Top 2% Talent · 48-Hour Matching"
  }
];

export const INITIAL_COURSES = [
  {
    id: "course-k8s-prod",
    title: "Production Kubernetes & GitOps Masterclass with ArgoCD",
    subtitle: "From Zero to Multi-Cluster Production Infrastructure with Helm, ArgoCD, and Zero-Downtime Rollouts",
    category: "Kubernetes & Containers",
    level: "Architect",
    certification: "CKA / GitOps",
    rating: 4.95,
    reviewsCount: 1420,
    duration: "18h 45m",
    enrolledCount: 3840,
    badge: "Bestseller",
    trainer: {
      id: "trainer-ikram",
      name: "Ikram Ullah",
      title: "Founder & Lead Cloud Architect",
      avatar: "/images/team/ikram-ullah.jpg",
      company: "IK Cloud Solutions"
    },
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=900",
    featured: true,
    price: 0,
    isFree: true,
    description: "Master the intricacies of deploying, monitoring, and self-healing mission-critical Kubernetes clusters in production. This comprehensive masterclass covers CKA exam essentials, GitOps continuous delivery with ArgoCD, ingress controllers, service mesh with Istio, and zero-downtime rolling upgrades.",
    skillsGained: ["Kubernetes Multi-Cluster", "ArgoCD GitOps", "Helm 3", "Prometheus & Grafana", "Pod Security Admission"],
    modules: [
      {
        id: "mod-1",
        title: "Module 1: Kubernetes Core Architecture & Production Topology",
        lessons: [
          {
            id: "les-1-1",
            title: "Control Plane Deep Dive: etcd, API Server & Kube-Scheduler",
            duration: "18:24",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            previewAllowed: true,
            summary: "Understand the raft consensus algorithm in etcd, API server rate limiting, and how kube-scheduler allocates pods to worker nodes under resource pressure.",
            notes: "### Key Commands\n`kubectl get componentstatuses`\n`kubectl get nodes -o wide`\n`etcdctl endpoint health`",
            terminalCommand: "kubectl get nodes -o wide",
            terminalOutput: "NAME                  STATUS   ROLES           AGE   VERSION    INTERNAL-IP\nik-control-plane-01   Ready    control-plane   42d   v1.31.1    10.0.1.10\nik-worker-pool-01     Ready    worker          42d   v1.31.1    10.0.2.14\nik-worker-pool-02     Ready    worker          42d   v1.31.1    10.0.2.15\nik-worker-pool-03     Ready    worker          42d   v1.31.1    10.0.2.16",
            quiz: {
              question: "Which component is the sole state store in a production Kubernetes control plane?",
              options: ["Kube-Scheduler", "CoreDNS", "etcd", "Kubelet"],
              correctIndex: 2,
              explanation: "etcd is a consistent, distributed key-value store used as the Kubernetes backing store for all cluster data."
            }
          },
          {
            id: "les-1-2",
            title: "Declarative Deployments & High Availability Pod Topology",
            duration: "24:10",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            previewAllowed: true,
            summary: "Implement PodDisruptionBudgets, topologySpreadConstraints, and anti-affinity rules to guarantee 99.999% uptime across multi-AZ clusters.",
            notes: "Always configure liveness and readiness probes with adequate initialDelaySeconds.",
            terminalCommand: "kubectl get deployments -A",
            terminalOutput: "NAMESPACE     NAME              READY   UP-TO-DATE   AVAILABLE   AGE\nproduction    ik-payment-api    5/5     5            5           14d\nproduction    ik-auth-service   3/3     3            3           14d\nmonitoring    prometheus-k8s    2/2     2            2           38d",
            quiz: {
              question: "What object prevents voluntary pod evictions from violating application SLA during node drains?",
              options: ["PodDisruptionBudget", "ResourceQuota", "LimitRange", "NetworkPolicy"],
              correctIndex: 0,
              explanation: "A PodDisruptionBudget (PDB) limits the number of pods of a replicated application that are down simultaneously from voluntary disruptions."
            }
          },
          {
            id: "les-1-3",
            title: "Multi-Tenant Network Policies & Calico CNI Isolation",
            duration: "21:45",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            previewAllowed: false,
            summary: "Implement Zero Trust east-west microsegmentation using Kubernetes NetworkPolicy and Calico CNI enforcement.",
            notes: "Default deny ingress and egress policies prevent lateral movement in case of pod compromise.",
            terminalCommand: "kubectl get netpol -n production",
            terminalOutput: "NAME                      POD-SELECTOR      AGE\ndefault-deny-all          <none>            21d\nallow-api-to-database     app=payment-api   21d\nallow-ingress-to-auth     app=auth          21d",
            quiz: {
              question: "What happens if a pod has no NetworkPolicy selecting it?",
              options: ["All traffic is blocked by default", "It is non-isolated and accepts traffic from all sources", "Only DNS is allowed", "It can only communicate on localhost"],
              correctIndex: 1,
              explanation: "By default, pods in Kubernetes are non-isolated; they accept traffic from any source unless selected by a NetworkPolicy."
            }
          }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: ArgoCD GitOps Continuous Delivery & Helm",
        lessons: [
          {
            id: "les-2-1",
            title: "ArgoCD Controller Architecture & Repo Sync Hooks",
            duration: "26:30",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            previewAllowed: false,
            summary: "Learn how the ArgoCD Application Controller polls Git repositories, computes resource diffs, and executes automated sync with pre/post-sync hooks.",
            notes: "Utilize SyncOptions like CreateNamespace=true and PruneLast=true for safe automated GitOps workflows.",
            terminalCommand: "argocd app list",
            terminalOutput: "NAME              CLUSTER                         STATUS  HEALTH   SYNCPOLICY  CONDITIONS  REPO\nik-frontend-app   https://kubernetes.default.svc  Synced  Healthy  Auto-Prune  <none>      github.com/ikcloud/manifests\nik-backend-api    https://kubernetes.default.svc  Synced  Healthy  Auto-Prune  <none>      github.com/ikcloud/manifests\nik-database-op    https://kubernetes.default.svc  Synced  Healthy  Manual      <none>      github.com/ikcloud/manifests",
            quiz: {
              question: "Which ArgoCD feature removes Kubernetes resources that have been deleted from the Git repository?",
              options: ["Self-Healing", "Automated Pruning", "Diff Suppression", "Resource Invalidation"],
              correctIndex: 1,
              explanation: "Automated Pruning ensures resources removed from the Git repository are automatically deleted from the live cluster."
            }
          },
          {
            id: "les-2-2",
            title: "Canary Deployments with Argo Rollouts & Prometheus Analysis",
            duration: "28:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            previewAllowed: false,
            summary: "Automate progressive traffic shifting (20% -> 50% -> 100%) with automated rollbacks when error rates exceed 0.5% in Prometheus.",
            notes: "Define AnalysisTemplates that query Prometheus metrics during each canary step.",
            terminalCommand: "kubectl argo rollouts status rollout ik-payment-api -n production",
            terminalOutput: "Rollout 'ik-payment-api' is in progress:\nStep 2/4: traffic weight 40% (2/5 pods updated)\nAnalysisRun 'payment-error-rate-check' passed: 0.02% error rate\nWaiting for pause duration: 5m",
            quiz: {
              question: "What custom resource replaces the standard Deployment when implementing canary analysis with Argo Rollouts?",
              options: ["CanarySpec", "Rollout", "ProgressiveDeploy", "ArgoService"],
              correctIndex: 1,
              explanation: "Argo Rollouts introduces the custom 'Rollout' resource, a drop-in replacement for Deployment that supports Canary and Blue-Green deployments."
            }
          }
        ]
      }
    ]
  },
  {
    id: "course-aws-architect",
    title: "AWS Multi-Region Enterprise Cloud Architecture & FinOps",
    subtitle: "Design Highly Available, Fault-Tolerant, and FinOps-Compliant AWS Infrastructures",
    category: "AWS & Multi-Cloud",
    level: "Architect",
    certification: "AWS Solutions Architect Professional",
    rating: 4.98,
    reviewsCount: 980,
    duration: "16h 20m",
    enrolledCount: 2950,
    badge: "Trending",
    trainer: {
      id: "trainer-aisha",
      name: "Aisha Rahman",
      title: "Principal Cloud Architect",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
      company: "IK Cloud Solutions"
    },
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=900",
    featured: true,
    price: 0,
    isFree: true,
    description: "Comprehensive enterprise AWS architecture covering Transit Gateways, AWS Organizations multi-account structure, Aurora Global Databases, Direct Connect, and advanced FinOps cost governance strategies.",
    skillsGained: ["AWS Organizations", "Transit Gateway", "Aurora Global DB", "AWS Control Tower", "FinOps RI/SP Optimization"],
    modules: [
      {
        id: "mod-aws-1",
        title: "Module 1: Multi-Account AWS Organization & Networking",
        lessons: [
          {
            id: "les-aws-1-1",
            title: "AWS Control Tower & Landing Zone Multi-Account Design",
            duration: "22:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            previewAllowed: true,
            summary: "Implement an enterprise multi-account strategy with separate Log Archive, Security, Shared Services, and Workload OUs.",
            notes: "Enforce Service Control Policies (SCPs) to deny root user actions and enforce region lockdown.",
            terminalCommand: "aws organizations list-accounts",
            terminalOutput: "{\n  \"Accounts\": [\n    {\"Id\": \"111122223333\", \"Name\": \"ik-security-core\", \"Status\": \"ACTIVE\"},\n    {\"Id\": \"444455556666\", \"Name\": \"ik-production-workloads\", \"Status\": \"ACTIVE\"},\n    {\"Id\": \"777788889999\", \"Name\": \"ik-staging-workloads\", \"Status\": \"ACTIVE\"}\n  ]\n}",
            quiz: {
              question: "Which AWS mechanism enforces guardrails across all member accounts without overriding local IAM policies?",
              options: ["IAM Role Assumption", "Service Control Policy (SCP)", "VPC Peering", "Security Group Rule"],
              correctIndex: 1,
              explanation: "Service Control Policies (SCPs) specify the maximum available permissions for an organization or organizational unit (OU)."
            }
          },
          {
            id: "les-aws-1-2",
            title: "Hub-and-Spoke Transit Gateway with Network Firewall",
            duration: "25:40",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
            previewAllowed: false,
            summary: "Route all inter-VPC and internet egress traffic through a centralized inspection VPC powered by AWS Network Firewall and Transit Gateway route tables.",
            notes: "Use Transit Gateway peering to connect eu-west-1 and us-east-1 securely over the AWS global backbone.",
            terminalCommand: "aws ec2 describe-transit-gateways",
            terminalOutput: "{\n  \"TransitGateways\": [\n    {\n      \"TransitGatewayId\": \"tgw-08a9f24c31e\",\n      \"State\": \"available\",\n      \"Description\": \"ik-enterprise-core-hub\"\n    }\n  ]\n}",
            quiz: {
              question: "What is the primary benefit of AWS Transit Gateway over full-mesh VPC peering?",
              options: ["It removes all bandwidth fees", "It scales hub-and-spoke networking to thousands of VPCs without N*(N-1)/2 connections", "It encrypts unencrypted HTTP without SSL certs", "It replaces the need for subnet route tables"],
              correctIndex: 1,
              explanation: "Transit Gateway acts as a cloud router, drastically simplifying VPC interconnection from complex meshes to a simple hub-and-spoke model."
            }
          }
        ]
      }
    ]
  },
  {
    id: "course-terraform-iac",
    title: "Production Terraform IaC: Modular Infrastructure & Drift Detection",
    subtitle: "Enterprise Infrastructure-as-Code Patterns with Automated CI/CD Testing & Atlantis",
    category: "Terraform & IaC",
    level: "Intermediate",
    certification: "HashiCorp Terraform Associate",
    rating: 4.92,
    reviewsCount: 760,
    duration: "14h 10m",
    enrolledCount: 2410,
    badge: "Popular",
    trainer: {
      id: "trainer-ikram",
      name: "Ikram Ullah",
      title: "Founder & Lead Cloud Architect",
      avatar: "/images/team/ikram-ullah.jpg",
      company: "IK Cloud Solutions"
    },
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=900",
    featured: false,
    price: 0,
    isFree: true,
    description: "Write clean, reusable, production-ready Terraform modules. Master remote state locking with S3 and DynamoDB, Terraform workspaces, terragrunt DRY patterns, policy-as-code with OPA, and automated PR plans via Atlantis.",
    skillsGained: ["Terraform 1.9+", "Terragrunt", "Remote State Locking", "OpenTofu / Terraform Cloud", "Infracost"],
    modules: [
      {
        id: "mod-tf-1",
        title: "Module 1: Modular Design & State Architecture",
        lessons: [
          {
            id: "les-tf-1-1",
            title: "Remote Backends, State Locking & Encryption at Rest",
            duration: "19:50",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
            previewAllowed: true,
            summary: "Configure secure remote state storage using S3 with SSE-KMS encryption and DynamoDB state lock prevention.",
            notes: "Never commit terraform.tfstate files to Git version control.",
            terminalCommand: "terraform init",
            terminalOutput: "Initializing the backend...\nSuccessfully configured the backend \"s3\"!\nTerraform has been successfully initialized in /infra/production/vpc.",
            quiz: {
              question: "What AWS DynamoDB attribute does Terraform rely on to manage concurrent state locks?",
              options: ["LockID", "StateKey", "SessionToken", "TerraformMutex"],
              correctIndex: 0,
              explanation: "Terraform expects a primary key named 'LockID' (string) on the DynamoDB locking table."
            }
          },
          {
            id: "les-tf-1-2",
            title: "Automated Cost Estimation in CI/CD using Infracost",
            duration: "21:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            previewAllowed: false,
            summary: "Add Infracost checks to your GitHub Actions pull requests to catch cloud cost spikes before infrastructure is provisioned.",
            notes: "Infracost integrates seamlessly with GitHub PR comments.",
            terminalCommand: "infracost breakdown --path .",
            terminalOutput: "Project: production-eks-cluster\nMonthly cost will increase by +$128.40 (18%)\n  + aws_eks_node_group.worker_spot: +$84.20\n  + aws_nat_gateway.nat_gw_az1: +$44.20",
            quiz: {
              question: "Why should FinOps checks like Infracost run during the pull request phase rather than after deploy?",
              options: ["To prevent architectural changes that violate budget before expenses occur", "Because AWS does not allow deleting resources once created", "Because Terraform cannot modify already deployed resources", "To speed up compile times"],
              correctIndex: 0,
              explanation: "Shifting FinOps left allows engineering teams to make cost-conscious decisions prior to merging and provisioning."
            }
          }
        ]
      }
    ]
  },
  {
    id: "course-agentic-ai",
    title: "Agentic AI & LLM Systems in Production Cloud",
    subtitle: "Architecting Autonomous AI Agents, Vector Pipelines, and High-Throughput Cloud Inference",
    category: "Agentic AI & MLOps",
    level: "Architect",
    certification: "Agentic Cloud Specialist",
    rating: 4.97,
    reviewsCount: 620,
    duration: "15h 40m",
    enrolledCount: 1890,
    badge: "Futuristic",
    trainer: {
      id: "trainer-priya",
      name: "Priya Menon",
      title: "Data & AI Engineering Lead",
      avatar: "/images/team/avatar-priya.svg",
      company: "IK Cloud Solutions"
    },
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=900",
    featured: true,
    price: 0,
    isFree: true,
    description: "Step into the future of cloud computing with Agentic AI. Learn to build autonomous agents that monitor, self-heal, and automate cloud infrastructure using LLM tool use, LangGraph/CrewAI architectures, pgvector, and vLLM inference clusters on GPU Kubernetes nodes.",
    skillsGained: ["Autonomous Agent Workflows", "Vector Databases (pgvector/Pinecone)", "vLLM GPU Serving", "Function Calling & Tools", "LangGraph"],
    modules: [
      {
        id: "mod-ai-1",
        title: "Module 1: Autonomous Agent Architectures & Tool Calling",
        lessons: [
          {
            id: "les-ai-1-1",
            title: "ReAct Loops, Tool Execution & Sandboxed Cloud Run",
            duration: "27:10",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            previewAllowed: true,
            summary: "Implement deterministic reason-and-act loops where autonomous agents diagnose Kubernetes incidents and generate remediation pull requests safely.",
            notes: "Always sandbox autonomous tool executions with strict RBAC boundary checks.",
            terminalCommand: "curl -X POST http://agent-cluster.internal/v1/diagnose -d '{\"incident\":\"CrashLoopBackOff\",\"pod\":\"ik-api-89b\"}'",
            terminalOutput: "{\n  \"agent\": \"ik-autonomous-cloud-agent\",\n  \"root_cause\": \"OOMKilled: Memory limit 512Mi exceeded at peak load\",\n  \"recommended_action\": \"Bump resources.limits.memory to 1024Mi\",\n  \"pr_opened\": \"https://github.com/ikcloud/manifests/pull/412\"\n}",
            quiz: {
              question: "What does the ReAct framework in autonomous agent design combine?",
              options: ["Reasoning and Acting via iterative thoughts and tool executions", "React.js frontend and Redux state", "Reactive programming and RxJS streams", "Read-only access and token validation"],
              correctIndex: 0,
              explanation: "ReAct stands for Reasoning and Acting, guiding LLM agents to iteratively reason through a problem and execute tools before outputting a solution."
            }
          }
        ]
      }
    ]
  },
  {
    id: "course-devsecops",
    title: "Enterprise DevSecOps: Zero Trust CI/CD & Cloud Compliance",
    subtitle: "Automate Vulnerability Scanning, Secrets Governance, and Policy-as-Code with Trivy & OPA",
    category: "DevSecOps & Security",
    level: "Intermediate",
    certification: "DevSecOps Certified Professional",
    rating: 4.89,
    reviewsCount: 540,
    duration: "12h 30m",
    enrolledCount: 1640,
    badge: "Security",
    trainer: {
      id: "trainer-ikram",
      name: "Ikram Ullah",
      title: "Founder & Lead Cloud Architect",
      avatar: "/images/team/ikram-ullah.jpg",
      company: "IK Cloud Solutions"
    },
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=900",
    featured: false,
    price: 0,
    isFree: true,
    description: "Transform standard pipelines into fortress-grade DevSecOps workflows. Implement container vulnerability scanning with Trivy, automated SBOM generation, static analysis with SonarQube, and policy guardrails with Open Policy Agent.",
    skillsGained: ["Trivy Vulnerability Scanner", "Open Policy Agent (OPA)", "Cosign Image Signing", "HashiCorp Vault", "SBOM Generation"],
    modules: [
      {
        id: "mod-sec-1",
        title: "Module 1: Pipeline Shift-Left Vulnerability Scanning",
        lessons: [
          {
            id: "les-sec-1-1",
            title: "Automated Container Image Vulnerability Gates with Trivy",
            duration: "20:40",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            previewAllowed: true,
            summary: "Fail builds automatically when CRITICAL CVEs with existing vendor fixes are detected in base images.",
            notes: "Use distroless or Alpine minimal container bases to reduce attack surface.",
            terminalCommand: "trivy image --severity CRITICAL ikcloud/api:latest",
            terminalOutput: "ikcloud/api:latest (alpine 3.20.1)\nTotal: 0 (CRITICAL: 0, HIGH: 0, MEDIUM: 1, LOW: 2)\nResult: PASSED security threshold for production deployment.",
            quiz: {
              question: "What is an SBOM (Software Bill of Materials) primarily used for in modern container security?",
              options: ["A complete inventory of all software components and dependencies in an artifact", "A billing breakdown of cloud server instances", "A list of cloud admin email addresses", "A Kubernetes pod restart log"],
              correctIndex: 0,
              explanation: "An SBOM provides transparency into all components, libraries, and dependencies included within a container artifact."
            }
          }
        ]
      }
    ]
  }
];

export const INITIAL_LEADERSHIP = [
  {
    name: "Ikram Ullah",
    role: "Founder & Chief Executive Officer",
    title: "Senior Enterprise Cloud & DevOps Architect",
    image: "/images/team/ikram-ullah.jpg",
    bio: "Pioneering high-velocity CI/CD automation, FinOps-aligned multi-cloud governance, and resilient Kubernetes infrastructure across the UK, Europe, and global enterprises. Passionate educator having mentored thousands of cloud engineers.",
    specialties: ["Multi-Cloud DevOps", "Kubernetes (EKS/AKS/GKE)", "Terraform IaC", "FinOps Leadership", "GitOps ArgoCD"]
  },
  {
    name: "Aisha Rahman",
    role: "Principal Cloud Architect",
    title: "Enterprise Systems & Zero Trust Lead",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    bio: "Specializes in multi-region AWS and Azure modernization, zero-downtime database migrations, and military-grade cloud networking topologies for Fortune 500 financial institutions.",
    specialties: ["AWS Solutions Architect", "Disaster Recovery", "Zero Trust Architecture", "Multi-Region Networking"]
  },
  {
    name: "Priya Menon",
    role: "Head of Data & AI Engineering",
    title: "Autonomous Agent & Analytics Lead",
    image: "/images/team/avatar-priya.svg",
    bio: "Architecting high-throughput data pipelines, autonomous agentic AI systems, and automated predictive telemetry platforms that turn raw cloud logs into operational business intelligence.",
    specialties: ["Agentic AI Systems", "Vector Databases", "Distributed Data Pipelines", "Kafka & Streaming"]
  }
];

export const INITIAL_CASE_STUDIES = [
  {
    client: "Tier-1 Fintech Banking Platform",
    service: "Kubernetes & GitOps Migration",
    metrics: "+450% Deployment Velocity",
    savings: "$320k Annual Cloud Savings",
    summary: "Migrated a legacy on-prem core banking application to an automated AWS EKS multi-region GitOps architecture with automated ArgoCD rollback and PCI-DSS compliance."
  },
  {
    client: "Global SaaS Logistics Network",
    service: "FinOps & Cloud Cost Optimization",
    metrics: "48% Monthly Cost Reduction",
    savings: "$540k Saved in 90 Days",
    summary: "Identified and eliminated multi-million dollar cloud waste via automated compute rightsizing, spot instance orchestration, and Aurora serverless v2 auto-scaling."
  },
  {
    client: "Healthcare Telemedicine Provider",
    service: "Agentic AI & Self-Healing Cloud",
    metrics: "99.999% High Availability",
    savings: "Zero Incident Escalations",
    summary: "Engineered autonomous AI agents that monitor health telemetry, automatically isolate noisy neighbor containers, and perform self-healing rollback in under 12 seconds."
  }
];

export const INITIAL_TESTIMONIALS = [
  {
    name: "Marcus Vance",
    role: "VP of Engineering, Global Cloud SaaS",
    comment: "IK Cloud Solutions transformed our deployment cycle from 3 days of manual anxiety to 8 minutes of automated, bulletproof GitOps. Ikram and his team are peerless cloud architects.",
    rating: 5
  },
  {
    name: "Elena Rostova",
    role: "Chief Technology Officer, PayStream Fintech",
    comment: "The IK Cloud Academy training transformed our internal engineering team. In 4 weeks, our developers were confidently writing production Kubernetes manifests and Terraform modules.",
    rating: 5
  },
  {
    name: "David MacLeod",
    role: "Head of Infrastructure, Scottish Enterprise",
    comment: "Their FinOps audit paid for itself within the first 14 days. We cut $28,000 off our monthly AWS bill without sacrificing a single millisecond of compute throughput.",
    rating: 5
  }
];
