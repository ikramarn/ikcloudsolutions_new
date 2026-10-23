import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { displayUnitRate } from '@/lib/money';

// Built-HTML claims-guard support. Only what a visitor (or a crawler reading structured data) can
// see is scanned: visible text, <title>, meta content values and JSON-LD string values. The RSC
// flight payload (self.__next_f.push) is NEVER scanned.

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
  '&pound;': '£',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp|pound);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/&#(\d+);/g, (_m, code: string) => String.fromCodePoint(Number(code)));
}

function collectStrings(value: unknown, into: string[]): void {
  if (typeof value === 'string') into.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, into);
  else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, into);
  }
}

function isJsonLdScript(attributes: string): boolean {
  return /\btype\s*=\s*["']?application\/ld\+json["']?/i.test(attributes);
}

export function extractGuardableText(html: string): string {
  const pieces: string[] = [];

  // JSON-LD string values (the only <script> content that is kept).
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!isJsonLdScript(match[1] ?? '')) continue;
    try {
      collectStrings(JSON.parse(match[2] ?? ''), pieces);
    } catch {
      // Malformed JSON-LD is a different test's problem; it must not hide visible text.
    }
  }

  // <title> and every <meta ... content="...">.
  for (const match of html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)) {
    pieces.push(decodeEntities(match[1] ?? ''));
  }
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const content = /\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag[0]);
    const value = content?.[1] ?? content?.[2];
    if (value) pieces.push(decodeEntities(value));
  }

  // Visible text: drop scripts, styles, noscript, comments, flight pushes and tags.
  const visible = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<title\b[\s\S]*?<\/title>/gi, ' ')
    .replace(/self\.__next_f\.push\(\[[\s\S]*?\]\)/g, ' ')
    .replace(/<[^>]*>/g, ' ');
  pieces.push(decodeEntities(visible));

  return pieces.join(' ').replace(/\s+/g, ' ').trim();
}

function numbersIn(text: string): string[] {
  const found: string[] = [];
  for (const token of text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []) {
    const plain = token.replace(/,/g, '');
    found.push(plain);
    // "0.024" also licenses its parts, so "24" and "0" never read as stray figures.
    for (const part of plain.split('.')) found.push(part.replace(/^0+(?=\d)/, ''));
  }
  return found;
}

/**
 * The only figures the pence-and-allowance-literals rule may find in built HTML: per-plan
 * allowances, the overage rates in the CURRENT VAT mode (pounds and pence forms) and the annual
 * discount percentage. Nothing else (no agent counts, no prices).
 */
export function derivableFigures(cfg: PricingConfig = pricingConfig): ReadonlySet<string> {
  const figures = new Set<string>();
  const add = (text: string) => {
    for (const figure of numbersIn(text)) figures.add(figure);
  };

  for (const plan of cfg.plans) {
    add(String(plan.allowances.voiceMinutes));
    add(String(plan.allowances.whatsappAiReplies));
    for (const tenths of [
      plan.overage.voicePerMinuteTenthsPence[cfg.currency],
      plan.overage.whatsappPerReplyTenthsPence[cfg.currency],
    ]) {
      const pounds = displayUnitRate(tenths, cfg.vat);
      add(pounds);
      // Pence form: £0.20 -> 20, £0.024 -> 2.4.
      const pence = Number(pounds.replace('£', '')) * 100;
      add(String(Number(pence.toFixed(1))));
    }
  }
  add(String(cfg.annualDiscountPercent));
  return figures;
}

/** Figures matched by a rule's regex in extracted text that are NOT derivable from pricing.ts. */
export function underivableFigures(
  text: string,
  re: RegExp,
  cfg: PricingConfig = pricingConfig,
): string[] {
  const allowed = derivableFigures(cfg);
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  const unknown: string[] = [];
  for (const match of text.matchAll(new RegExp(re.source, flags))) {
    const figure = /\d[\d,]*(?:\.\d+)?/.exec(match[0])?.[0]?.replace(/,/g, '');
    if (figure && !allowed.has(figure)) unknown.push(match[0]);
  }
  return unknown;
}
