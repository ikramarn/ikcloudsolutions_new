import Link from 'next/link';
import { Ph } from '@/components/legal/Placeholder';
import { siteConfig } from '@/config/site';
import type { LegalDocument } from '@/content/legal/types';

export const termsDocument: LegalDocument = {
  path: '/terms',
  title: 'Terms of service',
  lead: 'An outline of the terms that apply when a business orders services from IK Cloud Solutions.',
  lastUpdated: '2026-10-22',
  sections: [
    {
      id: 'parties',
      heading: 'Parties and scope',
      body: (
        <p>
          These terms are between {siteConfig.legalName ?? siteConfig.name} and the business that
          places an order (&ldquo;you&rdquo;). They cover consultancy and the AI Front Desk. Each
          order form can add or change terms for that order.
        </p>
      ),
    },
    {
      id: 'services',
      heading: 'The services',
      body: (
        <p>
          We provide the services described in your order. Features marked as planned or coming soon
          are not part of an order until they are listed on it.
        </p>
      ),
    },
    {
      id: 'ordering',
      heading: 'Ordering',
      body: (
        <p>
          You request a plan through the website or by email. A contract starts when we confirm your
          order in writing.
        </p>
      ),
    },
    {
      id: 'fees',
      heading: 'Fees, VAT and payment',
      body: (
        <>
          <p>
            Fees are in pounds sterling and are shown on the pricing page. VAT is added where
            applicable and the pricing page states how it is shown. Payment terms:{' '}
            <Ph>payment terms, for example due on invoice</Ph>.
          </p>
          <p>
            Third-party charges such as Meta conversation fees, telephone numbers and domain
            registrations are separate unless the order says otherwise.
          </p>
        </>
      ),
    },
    {
      id: 'term',
      heading: 'Term and cancellation',
      body: (
        <p>
          Cancellation and refunds are explained on the{' '}
          <Link href="/refund-and-cancellation">refund and cancellation page</Link>.
        </p>
      ),
    },
    {
      id: 'fair-use',
      heading: 'Allowances and fair use',
      body: (
        <p>
          Each plan includes allowances for voice minutes and AI WhatsApp replies, counted
          separately. Use above an allowance is charged at the overage rates on the pricing page. We
          may contact you if usage looks unusual.
        </p>
      ),
    },
    {
      id: 'your-responsibilities',
      heading: 'Your responsibilities',
      body: (
        <ul>
          <li>Give us accurate information about your business.</li>
          <li>Use the service lawfully and in line with our acceptable use policy.</li>
          <li>Hold a valid opt-in for anyone you message on WhatsApp.</li>
          <li>Keep the AI and call-recording notices switched on.</li>
        </ul>
      ),
    },
    {
      id: 'ai-limits',
      heading: 'Limits of AI',
      body: (
        <p>
          AI outputs can be wrong. The AI Front Desk is not for emergencies and does not give
          medical, legal or financial advice. You should review how it handles your callers and
          customers before and after launch.
        </p>
      ),
    },
    {
      id: 'third-parties',
      heading: 'Third-party platforms',
      body: (
        <p>
          The service depends on platforms such as Meta (WhatsApp) and telephone carriers. If a
          platform changes its rules or suspends an account, we may need to change or pause the
          affected channel. We will tell you as soon as we reasonably can.
        </p>
      ),
    },
    {
      id: 'ip',
      heading: 'Intellectual property',
      body: (
        <p>
          You keep ownership of your content and business information. We keep ownership of our
          tools, templates and know-how. <Ph>Solicitor to confirm ownership of deliverables</Ph>.
        </p>
      ),
    },
    {
      id: 'data-protection',
      heading: 'Data protection',
      body: (
        <p>
          Our roles and responsibilities are summarised on the{' '}
          <Link href="/dpa-summary">DPA summary page</Link>.
        </p>
      ),
    },
    {
      id: 'service-levels',
      heading: 'Service levels',
      body: (
        <p>
          Service levels, if any, are to be agreed in the order form. We do not publish a numeric
          availability target on this website.
        </p>
      ),
    },
    {
      id: 'liability',
      heading: 'Liability',
      body: (
        <p>
          Nothing limits liability that cannot be limited by law, including for death or personal
          injury caused by negligence or for fraud. Otherwise our total liability is capped at{' '}
          <Ph>liability cap</Ph>. <Ph>Solicitor to confirm</Ph>.
        </p>
      ),
    },
    {
      id: 'termination',
      heading: 'Termination',
      body: (
        <p>
          Either party may end the contract for serious breach that is not fixed within{' '}
          <Ph>notice period</Ph>. We may suspend a service that breaks the{' '}
          <Link href="/acceptable-use">acceptable use policy</Link>.
        </p>
      ),
    },
    {
      id: 'governing-law',
      heading: 'Governing law',
      body: (
        <p>
          These terms are governed by the law of Scotland and the Scottish courts have jurisdiction.{' '}
          <Ph>Solicitor to confirm governing law and jurisdiction</Ph>.
        </p>
      ),
    },
  ],
};
