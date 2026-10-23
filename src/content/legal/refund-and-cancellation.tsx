import { Ph } from '@/components/legal/Placeholder';
import { siteConfig } from '@/config/site';
import type { LegalDocument } from '@/content/legal/types';

export const refundDocument: LegalDocument = {
  path: '/refund-and-cancellation',
  title: 'Refunds and cancellation',
  lead: 'A plain-English summary of how cancellation and refunds work for the AI Front Desk and our setup services.',
  lastUpdated: '2026-10-22',
  sections: [
    {
      id: 'summary',
      heading: 'Summary',
      body: (
        <p>
          You can cancel a monthly plan at any time and it ends at the end of the period you have
          paid for. There is a 14-day cancellation window on a first subscription. Setup work and
          third-party costs are treated differently, as explained below.
        </p>
      ),
    },
    {
      id: 'monthly',
      heading: 'Monthly plans',
      body: (
        <p>
          Cancel by email before your next billing date. The plan stays active until the end of the
          current billing period and is not charged again.
        </p>
      ),
    },
    {
      id: 'fourteen-days',
      heading: '14-day cancellation on a first subscription',
      body: (
        <p>
          We give business customers 14 days from the start of a first subscription to cancel for a
          refund of the subscription fee, less any usage above the plan allowance. Consumers have
          this right under the Consumer Contracts (Information, Cancellation and Additional Charges)
          Regulations 2013. <Ph>Solicitor to confirm which customers are consumers</Ph>.
        </p>
      ),
    },
    {
      id: 'setup-fees',
      heading: 'Setup fees',
      body: (
        <p>
          A setup fee is refundable in proportion to the work not yet started. Once delivery has
          begun at your request, the part already delivered is not refundable.
        </p>
      ),
    },
    {
      id: 'annual',
      heading: 'Annual plans',
      body: (
        <p>
          You can cancel an annual plan within 14 days for a full refund of the subscription fee.
          After that, a refund of the unused months is at our discretion unless the law says
          otherwise. <Ph>Solicitor to confirm</Ph>.
        </p>
      ),
    },
    {
      id: 'third-party',
      heading: 'Third-party costs',
      body: (
        <p>
          Fees we have already paid to others on your behalf are not refundable. That includes Meta
          conversation fees, domain registrations and telephone numbers already bought.
        </p>
      ),
    },
    {
      id: 'how-to-cancel',
      heading: 'How to cancel',
      body: (
        <p>
          Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> from the address on
          your account and say which plan you want to cancel. We will confirm by reply.
        </p>
      ),
    },
  ],
};
