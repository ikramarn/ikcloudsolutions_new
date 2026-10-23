// Sample Academy content. Everything here is placeholder material for a demo, not a paid course.
// There are deliberately no ratings, review counts, enrolment counts, badges, trainers or
// certification wording. Course durations are computed from lesson durations (see
// src/lib/academy/course-stats.ts), never typed.

export const CATEGORIES = [
  'Kubernetes and containers',
  'AWS and multi-cloud',
  'Terraform and IaC',
  'DevSecOps and security',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type Level = (typeof LEVELS)[number];

export const THUMBNAIL_ICONS = ['boxes', 'cloud', 'layers', 'shield-check'] as const;
export type ThumbnailIcon = (typeof THUMBNAIL_ICONS)[number];

export const THUMBNAIL_GRADIENTS = ['cyan', 'violet', 'emerald', 'amber'] as const;
export type ThumbnailGradient = (typeof THUMBNAIL_GRADIENTS)[number];

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonResource {
  label: string;
  href: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Planned lesson length. The sample video is a placeholder and does not match it. */
  durationSeconds: number;
  videoUrl: string;
  summary: string;
  /** Plain text, paragraphs separated by a blank line. */
  notes: string;
  terminalCommand: string;
  /** Illustrative only: never produced by a real environment. */
  terminalOutput: string;
  quiz: Quiz;
  resources: LessonResource[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  level: Level;
  skills: string[];
  thumbnail: { gradient: ThumbnailGradient; icon: ThumbnailIcon };
  modules: CourseModule[];
  /** True for courses made in the demo course editor. */
  custom?: boolean;
}

// Placeholder videos hosted by a third party. They may disappear and are labelled as samples.
export const SAMPLE_VIDEO_BASE =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
export const DEFAULT_SAMPLE_VIDEO = `${SAMPLE_VIDEO_BASE}BigBuckBunny.mp4`;
const video = (name: string) => `${SAMPLE_VIDEO_BASE}${name}.mp4`;

export const sampleCourses: readonly Course[] = [
  {
    id: 'kubernetes-gitops',
    title: 'Kubernetes and GitOps with ArgoCD',
    subtitle:
      'How a cluster is put together and how Git becomes the source of truth for deployments.',
    category: 'Kubernetes and containers',
    level: 'Intermediate',
    skills: ['Kubernetes', 'ArgoCD', 'GitOps', 'Helm'],
    thumbnail: { gradient: 'cyan', icon: 'boxes' },
    modules: [
      {
        id: 'k8s-m1',
        title: 'Cluster fundamentals',
        lessons: [
          {
            id: 'k8s-control-plane',
            title: 'The control plane and its components',
            durationSeconds: 18 * 60 + 24,
            videoUrl: video('BigBuckBunny'),
            summary: 'What the API server, etcd, scheduler and controllers each do.',
            notes:
              'The API server is the front door of the cluster. Every other component talks to it.\n\netcd holds the cluster state. If you lose it without a backup, you lose the cluster definition.\n\nThe scheduler decides which node a new pod runs on. Controllers keep running work in line with what you declared.',
            terminalCommand: 'kubectl get nodes -o wide',
            terminalOutput:
              'NAME            STATUS   ROLES           VERSION\ncontrol-plane   Ready    control-plane   v1.31.1\nworker-a        Ready    worker          v1.31.1\nworker-b        Ready    worker          v1.31.1',
            quiz: {
              question: 'Which component stores the state of a Kubernetes cluster?',
              options: ['etcd', 'kube-scheduler', 'kubelet', 'CoreDNS'],
              correctIndex: 0,
              explanation: 'etcd is the key-value store that holds the cluster state.',
            },
            resources: [
              {
                label: 'Kubernetes components (official docs)',
                href: 'https://kubernetes.io/docs/concepts/overview/components/',
              },
            ],
          },
          {
            id: 'k8s-deployments',
            title: 'Deployments and rolling updates',
            durationSeconds: 24 * 60 + 10,
            videoUrl: video('ElephantsDream'),
            summary: 'Declaring the state you want and letting Kubernetes get there safely.',
            notes:
              'A Deployment describes the pods you want and how many replicas to keep running.\n\nA rolling update replaces pods gradually, so the application keeps serving requests while the new version starts.\n\nReadiness probes tell Kubernetes when a new pod is ready to receive traffic.',
            terminalCommand: 'kubectl get deployments',
            terminalOutput:
              'NAME      READY   UP-TO-DATE   AVAILABLE\nweb-api   3/3     3            3\nworker    2/2     2            2',
            quiz: {
              question: 'What does a readiness probe tell Kubernetes?',
              options: [
                'Whether a pod is ready to receive traffic',
                'Whether the node has enough disk space',
                'Which image version to pull',
                'When to delete a namespace',
              ],
              correctIndex: 0,
              explanation:
                'A pod that fails its readiness probe is taken out of service endpoints until it passes again.',
            },
            resources: [
              {
                label: 'Deployments (official docs)',
                href: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
              },
            ],
          },
        ],
      },
      {
        id: 'k8s-m2',
        title: 'GitOps delivery',
        lessons: [
          {
            id: 'k8s-argocd-sync',
            title: 'How ArgoCD syncs from Git',
            durationSeconds: 26 * 60 + 30,
            videoUrl: video('ForBiggerEscapes'),
            summary: 'Comparing desired state in Git with live state in the cluster.',
            notes:
              'ArgoCD watches a Git repository and compares it with what is running in the cluster.\n\nWhen they differ, the application shows as out of sync. Automated sync can apply the change for you.\n\nPruning removes resources that were deleted from Git, so the cluster does not keep stale objects.',
            terminalCommand: 'argocd app list',
            terminalOutput:
              'NAME      STATUS   HEALTH    SYNCPOLICY\nweb-app   Synced   Healthy   Auto-Prune\napi-app   Synced   Healthy   Manual',
            quiz: {
              question:
                'Which ArgoCD option removes cluster resources that were deleted from the Git repository?',
              options: ['Pruning', 'Self-heal', 'Rollback', 'Hooks'],
              correctIndex: 0,
              explanation: 'Pruning deletes live resources that no longer exist in Git.',
            },
            resources: [
              {
                label: 'ArgoCD architecture (official docs)',
                href: 'https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'aws-foundations',
    title: 'AWS multi-account foundations',
    subtitle: 'Structuring accounts and networks so that growth does not become a tangle.',
    category: 'AWS and multi-cloud',
    level: 'Intermediate',
    skills: ['AWS Organizations', 'Landing zones', 'Networking'],
    thumbnail: { gradient: 'violet', icon: 'cloud' },
    modules: [
      {
        id: 'aws-m1',
        title: 'Accounts and networks',
        lessons: [
          {
            id: 'aws-organisations',
            title: 'Organisations and landing zones',
            durationSeconds: 22 * 60 + 15,
            videoUrl: video('TearsOfSteel'),
            summary: 'Why separate accounts for workloads, security and shared services.',
            notes:
              'Separate accounts limit the blast radius of a mistake and make billing easier to read.\n\nA landing zone sets up the baseline: logging, guardrails and identity, before teams start building.\n\nService control policies set boundaries that no account administrator can step outside.',
            terminalCommand: 'aws organizations list-accounts',
            terminalOutput:
              '{\n  "Accounts": [\n    { "Name": "security", "Status": "ACTIVE" },\n    { "Name": "production", "Status": "ACTIVE" },\n    { "Name": "staging", "Status": "ACTIVE" }\n  ]\n}',
            quiz: {
              question: 'What is the main benefit of separating workloads into accounts?',
              options: [
                'It limits the impact of a mistake or a compromise',
                'It makes every service faster',
                'It removes the need for IAM',
                'It stops all cost growth',
              ],
              correctIndex: 0,
              explanation: 'Account boundaries are a strong isolation boundary in AWS.',
            },
            resources: [
              {
                label: 'AWS Organizations (official docs)',
                href: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html',
              },
            ],
          },
          {
            id: 'aws-hub-spoke',
            title: 'Hub-and-spoke networking with a transit gateway',
            durationSeconds: 25 * 60 + 40,
            videoUrl: video('WeAreGoingOnBullrun'),
            summary: 'Connecting many networks through one controlled hub.',
            notes:
              'A transit gateway acts as a hub that spoke networks attach to.\n\nRoute tables decide which spokes may talk to each other, so production and test can stay apart.\n\nInspection and egress controls can be placed in the hub instead of being repeated in every spoke.',
            terminalCommand: 'aws ec2 describe-transit-gateways',
            terminalOutput:
              '{\n  "TransitGateways": [\n    { "State": "available", "Description": "shared-hub" }\n  ]\n}',
            quiz: {
              question:
                'In a hub-and-spoke design, what decides which spokes can reach each other?',
              options: [
                'Transit gateway route tables',
                'The AWS region name',
                'Instance size',
                'Tag values',
              ],
              correctIndex: 0,
              explanation:
                'Route tables on the transit gateway control propagation between attachments.',
            },
            resources: [
              {
                label: 'What is a transit gateway (official docs)',
                href: 'https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'terraform-state',
    title: 'Terraform state and safe changes',
    subtitle: 'Keeping state safe and reading a plan properly before anything is applied.',
    category: 'Terraform and IaC',
    level: 'Beginner',
    skills: ['Terraform', 'Remote state', 'Code review'],
    thumbnail: { gradient: 'emerald', icon: 'layers' },
    modules: [
      {
        id: 'tf-m1',
        title: 'State and plans',
        lessons: [
          {
            id: 'tf-remote-state',
            title: 'Remote state and locking',
            durationSeconds: 19 * 60 + 50,
            videoUrl: video('WhatCarCanYouGetForAGrand'),
            summary: 'Why state lives in a shared backend with a lock.',
            notes:
              'Terraform state maps your code to real resources. Losing it makes changes risky.\n\nA remote backend keeps one shared copy, and locking stops two people applying at once.\n\nState can contain sensitive values, so the backend should be encrypted and access should be limited.',
            terminalCommand: 'terraform init',
            terminalOutput:
              'Initializing the backend...\nSuccessfully configured the backend "s3"!\nTerraform has been successfully initialized!',
            quiz: {
              question: 'Why use state locking?',
              options: [
                'To stop two people changing the same state at the same time',
                'To make plans run faster',
                'To hide provider versions',
                'To avoid writing modules',
              ],
              correctIndex: 0,
              explanation: 'Locking prevents concurrent writes that could corrupt the state.',
            },
            resources: [
              {
                label: 'Terraform backends (official docs)',
                href: 'https://developer.hashicorp.com/terraform/language/backend',
              },
            ],
          },
          {
            id: 'tf-read-plan',
            title: 'Reading a plan before you apply',
            durationSeconds: 21 * 60 + 15,
            videoUrl: video('ForBiggerFun'),
            summary: 'Spotting replacements and deletions during review.',
            notes:
              'A plan lists what Terraform will add, change or destroy.\n\nA resource marked as replaced is destroyed and created again, which can mean downtime or data loss.\n\nReview the plan in the pull request, not only the code diff.',
            terminalCommand: 'terraform plan',
            terminalOutput:
              'Terraform will perform the following actions:\n  # aws_instance.web must be replaced\n  + aws_s3_bucket.logs will be created\nPlan: 2 to add, 0 to change, 1 to destroy.',
            quiz: {
              question: 'What does "must be replaced" mean in a plan?',
              options: [
                'The resource is destroyed and created again',
                'The resource is only renamed',
                'Nothing will change',
                'The plan has failed',
              ],
              correctIndex: 0,
              explanation: 'Replacement means a destroy followed by a create, so check for impact.',
            },
            resources: [
              {
                label: 'terraform plan (official docs)',
                href: 'https://developer.hashicorp.com/terraform/cli/commands/plan',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'devsecops-pipelines',
    title: 'DevSecOps in the delivery pipeline',
    subtitle: 'Adding security checks where developers already work, without slowing them down.',
    category: 'DevSecOps and security',
    level: 'Intermediate',
    skills: ['Image scanning', 'Policy as code', 'CI/CD'],
    thumbnail: { gradient: 'amber', icon: 'shield-check' },
    modules: [
      {
        id: 'sec-m1',
        title: 'Shift-left checks',
        lessons: [
          {
            id: 'sec-image-scan',
            title: 'Scanning container images in CI',
            durationSeconds: 20 * 60 + 40,
            videoUrl: video('ForBiggerBlazes'),
            summary: 'Failing a build on serious findings before an image is published.',
            notes:
              'Scan the image in the pipeline so findings appear in the pull request, not after release.\n\nSet a threshold your team agrees on, for example fail on critical findings and report the rest.\n\nKeep base images small and updated, because most findings come from the base layer.',
            terminalCommand: 'trivy image --severity CRITICAL app:latest',
            terminalOutput: 'app:latest (alpine)\nTotal: 0 (CRITICAL: 0)\nThreshold check passed.',
            quiz: {
              question: 'Why scan images in the pipeline rather than after release?',
              options: [
                'Problems are found while they are cheap to fix',
                'It removes the need for updates',
                'It replaces code review',
                'It makes images smaller',
              ],
              correctIndex: 0,
              explanation:
                'Earlier findings are quicker and cheaper to fix than production incidents.',
            },
            resources: [
              { label: 'Trivy (project page)', href: 'https://github.com/aquasecurity/trivy' },
            ],
          },
          {
            id: 'sec-policy-code',
            title: 'Policy as code basics',
            durationSeconds: 23 * 60 + 5,
            videoUrl: video('BigBuckBunny'),
            summary: 'Writing rules once and enforcing them automatically.',
            notes:
              'Policy as code expresses rules, such as no public storage buckets, in files that are reviewed like any other code.\n\nThe rules run in the pipeline and at admission time, so the same check applies everywhere.\n\nStart with a few clear rules and add more as the team learns what matters.',
            terminalCommand: 'opa eval --data policy.rego "data.storage.deny"',
            terminalOutput: '{\n  "result": [ "bucket logs-public must not allow public read" ]\n}',
            quiz: {
              question: 'What is a benefit of policy as code?',
              options: [
                'Rules are versioned, reviewed and enforced automatically',
                'Rules no longer need owners',
                'Developers can skip tests',
                'Audits are no longer needed',
              ],
              correctIndex: 0,
              explanation: 'Treating policy like code makes it testable and repeatable.',
            },
            resources: [
              {
                label: 'Open Policy Agent documentation',
                href: 'https://www.openpolicyagent.org/docs/latest/',
              },
            ],
          },
        ],
      },
    ],
  },
];
