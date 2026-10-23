// Pure module: NO imports, because next.config.ts loads it by relative path. Old URLs from the
// Vite site and the prototype map to their new homes with permanent (308) redirects.
export interface RedirectRule {
  source: string;
  destination: string;
  permanent: true;
}

const to = (source: string, destination: string): RedirectRule => ({
  source,
  destination,
  permanent: true,
});

export const redirectRules: readonly RedirectRule[] = [
  to('/index.html', '/'),
  to('/contact.php', '/contact'),
  to('/trainer-studio', '/academy/studio'),
  to('/simulator', '/services#finops-estimator'),
  to('/ai-agent', '/ai-agents'),
  to('/ai-front-desk', '/ai-agents'),
  to('/agents', '/ai-agents'),
  to('/pricing', '/ai-agents/pricing'),
  to('/privacy-policy', '/privacy'),
  to('/terms-of-service', '/terms'),
];
