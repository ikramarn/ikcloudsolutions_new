import { pricingConfig } from '@/config/pricing';

/** No numeric Meta rates: they vary by country and category and change over time. */
export function MetaFeesNote() {
  return (
    <aside className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-slate-200">
      <p>
        WhatsApp message fees are charged by Meta, not by us. You add your own payment method to
        your WhatsApp Business account and Meta bills you directly. Rates vary by country and
        message category and change over time, so we do not quote them here. See{' '}
        <a
          href={pricingConfig.metaPricingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-cyan-300 underline underline-offset-2"
        >
          Meta&apos;s official pricing
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </p>
    </aside>
  );
}
