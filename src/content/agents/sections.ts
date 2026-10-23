// Shared shapes for the AI Front Desk pages. Plain data only: copy never contains a price,
// allowance, overage rate or VAT phrase (those come from src/config/pricing.ts via CopyContext).

export interface AgentFeature {
  readonly title: string;
  readonly description: string;
}

/** One content block on an AI Front Desk page. Exactly one of the body fields is used. */
export interface AgentSection {
  readonly id: string;
  readonly heading: string;
  readonly intro?: string;
  readonly features?: readonly AgentFeature[];
  readonly steps?: readonly AgentFeature[];
  readonly bullets?: readonly string[];
  readonly note?: string;
}

export interface AgentPage {
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly AgentSection[];
}
