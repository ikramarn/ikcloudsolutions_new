import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// The archive must never be imported (ESLint and the claims-guard enforce that), so this test
// reads it as text.
const source = readFileSync(resolve(process.cwd(), 'src/data/_unverified-content.ts'), 'utf8');

const inventory = [
  'SYSTEM TELEMETRY',
  '100% Synced',
  'LIVE CLOUD TELEMETRY',
  '64 Worker Nodes',
  '32 Worker Nodes',
  'latency 14ms',
  'GLOBAL GITOPS CLOUD PLATFORM: OPERATIONAL',
  '500+ Cloud Modernizations',
  '42% Average FinOps Reduction',
  '99.999% GitOps Infrastructure SLA',
  '14,500+ Engineers Trained',
  'Zero Drift GitOps',
  '40%+ FinOps Savings',
  'Production K8s SLA',
  '70% Faster Deployments',
  '3.5x Faster Workflows',
  'Zero Data Loss',
  '35% - 50% Cloud Spend Reduction in 60 Days',
  '100% Policy-as-Code',
  'Top 2% Talent',
  '24/7/365 On-Call GitOps Engineers',
  'within 4 hours',
  '8.5x Faster',
  'Tier-1 Fintech Banking Platform',
  'Global SaaS Logistics Network',
  'Healthcare Telemedicine Provider',
  'Marcus Vance',
  'Elena Rostova',
  'David MacLeod',
  'Aisha Rahman',
  'Priya Menon',
  'mentored thousands of cloud engineers',
  'Fortune 500 financial institutions',
  'Over 80+ hours',
  '18h 45m',
  'PCI-DSS',
  'SOC2, ISO27001, HIPAA, GDPR',
  'Military-Grade',
  'DEFAULT_ACCOUNTS',
  'api.dicebear.com',
  'Global Headquarters',
  'Physical Office',
  'Transmission Dispatched',
  'Analytics',
  '24ms latency',
  '99.98% uptime',
  '4.8M+ calls handled',
  '0% hallucination boundary',
  'PCI-Level 1 Enclave',
  '100% white-label isolation',
  'Apex Dynamics',
];

describe('removed-content archive', () => {
  it('keeps every item from the design inventory, verbatim', () => {
    const missing = inventory.filter((text) => !source.toLowerCase().includes(text.toLowerCase()));
    // "Analytics" is covered by the trainer analytics entry's source label.
    expect(missing).toEqual([]);
  });

  it('redacts the founder password', () => {
    // Every password value in the archive must be the redaction marker, never a real string.
    const values = [...source.matchAll(/password:\s*"([^"]*)"/g)].map((match) => match[1]);
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((value) => value === '[REDACTED]')).toBe(true);
  });

  it('gives every entry a unique id and a reinstatement requirement', () => {
    const ids = [...source.matchAll(/^\s+id: '([^']+)'/gm)].map((match) => match[1]);
    expect(ids.length).toBeGreaterThan(40);
    expect(new Set(ids).size).toBe(ids.length);
    const requirements = [...source.matchAll(/^\s+neededToReinstate:/gm)];
    expect(requirements.length).toBe(ids.length);
  });
});
