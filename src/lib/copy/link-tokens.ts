// {{link:/path|label}} tokens keep one plain-text source for the UI and for JSON-LD.
const LINK_TOKEN = /\{\{link:([^|}]+)\|([^}]+)\}\}/g;

export type AnswerPart =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'link'; readonly href: string; readonly label: string };

export function parseLinkTokens(text: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: 'text', value: text.slice(last, index) });
    parts.push({ kind: 'link', href: match[1] ?? '', label: match[2] ?? '' });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: 'text', value: text.slice(last) });
  return parts;
}

/** Plain text for JSON-LD: each token becomes its label. */
export function stripLinkTokens(text: string): string {
  return text.replace(LINK_TOKEN, (_token, _href: string, label: string) => label);
}
