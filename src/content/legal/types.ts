import type { ReactNode } from 'react';

export interface LegalSection {
  /** Anchor id used by the table of contents. */
  id: string;
  heading: string;
  body: ReactNode;
}

export interface LegalDocument {
  /** Route path, for example '/privacy'. Must exist in the route registry. */
  path: string;
  /** The h1. */
  title: string;
  lead: string;
  /** ISO date, edited by hand when the text changes. */
  lastUpdated: string;
  sections: readonly LegalSection[];
}
