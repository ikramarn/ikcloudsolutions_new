import 'server-only';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { displayAmount, formatMoney, vatNote } from '@/lib/money';
import { estimateTotals } from '@/lib/pricing';
import { buildIdempotencyKey, leadDisplayName } from '@/lib/server/mail/compose';
import type { OutboundEmail } from '@/lib/server/mail/types';
import { escapeHtml, stripCrlf } from '@/lib/server/sanitize';
import type { AgentLead, Lead } from '@/lib/validation/lead';

/** Version of the wording shown next to the consent checkbox. Bump when that wording changes. */
export const CONSENT_VERSION = 'v1';

export interface LeadEmailContext {
  reference: string;
  from: string;
  to: readonly string[];
  pricing?: PricingConfig;
}

type Row = readonly [label: string, value: string | undefined];

const SOURCE_BY_TYPE: Record<Lead['type'], string> = {
  contact: 'Contact form',
  consultation: 'Consultation dialog',
  'agent-lead': 'AI Front Desk intake',
};

export function buildSubject(lead: Lead): string {
  if (lead.type === 'agent-lead') {
    return `[IK Leads] AI Front Desk enquiry: ${stripCrlf(lead.businessName).slice(0, 60)}`;
  }
  const name = stripCrlf(leadDisplayName(lead));
  return lead.type === 'contact'
    ? `[IK Leads] Contact: ${name}`
    : `[IK Leads] Consultation request: ${name}`;
}

function describeEstimate(lead: AgentLead, pricing: PricingConfig): Row[] {
  const totals = estimateTotals(
    {
      planId: lead.plan,
      billing: lead.billing,
      channel: lead.channel,
      setupPreference: lead.setupPreference,
      addonIds: lead.addons,
    },
    pricing,
  );
  if (!totals) return [['Estimate', 'We will recommend a plan']];

  const { currency, vat } = pricing;
  const money = (net: number): string => {
    const shown = displayAmount(net, vat);
    const base = [formatMoney(shown, currency), vatNote(vat.mode)].filter(Boolean).join(' ');
    return shown === net ? base : `${base} (net ${formatMoney(net, currency)})`;
  };
  const rows: Row[] = [
    ['Estimate (indicative)', 'Indicative only. We confirm a quote before you pay anything.'],
    ['Plan billed now', money(totals.planBilledNow)],
    ['First payment', money(totals.firstPayment)],
    ['Monthly recurring', totals.monthlyRecurring > 0 ? money(totals.monthlyRecurring) : 'None'],
    [
      'One-time',
      totals.oneTime > 0
        ? `${totals.oneTimeIsFrom ? 'from ' : ''}${money(totals.oneTime)}`
        : 'None',
    ],
    ['Yearly recurring', totals.yearlyRecurring > 0 ? money(totals.yearlyRecurring) : 'None'],
  ];
  const name = (id: string) => pricing.addons.find((addon) => addon.id === id)?.name ?? id;
  if (totals.autoAdded.length > 0) {
    rows.push(['Added automatically', totals.autoAdded.map(name).join(', ')]);
  }
  if (totals.ignored.length > 0) {
    rows.push(['Not included in the estimate', totals.ignored.map(name).join(', ')]);
  }
  return rows;
}

function leadRows(lead: Lead, pricing: PricingConfig): Row[] {
  const consent: Row[] = [
    [`Consent (${CONSENT_VERSION})`, lead.type === 'agent-lead' ? 'yes' : 'no'],
    ['Marketing opt-in', lead.marketingOptIn ? 'yes' : 'no'],
  ];

  if (lead.type === 'contact') {
    return [
      ['Name', leadDisplayName(lead)],
      ['Email', lead.email],
      ['Subject', lead.subject],
      ['Interest', lead.interest],
      ['Message', lead.message],
      ...consent,
    ];
  }

  if (lead.type === 'consultation') {
    return [
      ['Name', lead.name],
      ['Email', lead.email],
      ['Phone', lead.phone],
      ['Company', lead.company],
      ['Role', lead.roleTitle],
      ['Focus', lead.focus],
      ['Cloud provider', lead.cloudProvider],
      ['Monthly cloud spend', lead.monthlySpend],
      ['Preferred date', lead.preferredDate],
      ['Preferred time (UK time)', lead.preferredTimeWindow],
      ['Notes', lead.notes],
      ...consent,
    ];
  }

  const addonNames = lead.addons.map(
    (id) => pricing.addons.find((addon) => addon.id === id)?.name ?? id,
  );
  return [
    ['Business', lead.businessName],
    ['Contact name', lead.contactName],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Website', lead.hasNoWebsite ? 'No website yet' : lead.websiteUrl],
    ['Industry', lead.industry === 'other' ? `Other: ${lead.industryOther ?? ''}` : lead.industry],
    ['Channel', lead.channel],
    ['Plan', lead.plan === 'not-sure' ? 'We will recommend a plan' : lead.plan],
    ['Billing', lead.billing],
    ['Add-ons', addonNames.length > 0 ? addonNames.join(', ') : 'None'],
    ['Set-up', lead.setupPreference],
    ['Notes', lead.notes],
    ...describeEstimate(lead, pricing),
    ...consent,
  ];
}

function renderText(reference: string, source: string, rows: readonly Row[]): string {
  const lines = [`Reference: ${reference}`, `Source: ${source}`, ''];
  for (const [label, value] of rows) {
    if (value !== undefined && value !== '') lines.push(`${label}: ${value}`);
  }
  return lines.join('\n');
}

function renderHtml(reference: string, source: string, rows: readonly Row[]): string {
  const body = rows
    .filter((row): row is readonly [string, string] => row[1] !== undefined && row[1] !== '')
    .map(
      ([label, value]) =>
        `<tr><th align="left" valign="top">${escapeHtml(label)}</th><td>${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('');
  return [
    '<table cellpadding="6" cellspacing="0" border="0">',
    `<tr><th align="left">Reference</th><td>${escapeHtml(reference)}</td></tr>`,
    `<tr><th align="left">Source</th><td>${escapeHtml(source)}</td></tr>`,
    body,
    '</table>',
  ].join('');
}

/**
 * Builds the owner's notification. Every interpolated value is escaped for HTML, header-bound
 * values are CR/LF-free, estimates are recomputed here from config, and the body carries no
 * timestamp so identical retries produce the same idempotency key.
 */
export function buildLeadEmail(lead: Lead, context: LeadEmailContext): OutboundEmail {
  const pricing = context.pricing ?? pricingConfig;
  const source = SOURCE_BY_TYPE[lead.type];
  const rows = leadRows(lead, pricing);
  const subject = buildSubject(lead);
  const text = renderText(context.reference, source, rows);
  const html = renderHtml(context.reference, source, rows);
  return {
    from: context.from,
    to: context.to,
    replyTo: stripCrlf(lead.email),
    subject,
    html,
    text,
    idempotencyKey: buildIdempotencyKey(context.reference, { subject, text, html }),
  };
}
