import Link from 'next/link';
import { Ph } from '@/components/legal/Placeholder';
import type { LegalDocument } from '@/content/legal/types';

interface Subprocessor {
  name: string;
  purpose: string;
  note?: string;
}

// Planned, not confirmed: the table is headed accordingly and the owner confirms before launch.
const subprocessors: readonly Subprocessor[] = [
  { name: 'Vercel', purpose: 'Website hosting' },
  { name: 'Resend', purpose: 'Transactional email' },
  { name: 'Cloudflare', purpose: 'Turnstile spam protection' },
  { name: 'Retell (planned)', purpose: 'Voice orchestration' },
  { name: 'Telnyx (planned)', purpose: 'UK telephony carrier' },
  {
    name: 'Meta',
    purpose: 'WhatsApp Business Platform',
    note: 'Also acts as an independent controller for some data.',
  },
  {
    name: 'To be confirmed',
    purpose: 'Large language model provider',
    note: 'Terms that rule out training on customer data are required.',
  },
];

export const dpaSummaryDocument: LegalDocument = {
  path: '/dpa-summary',
  title: 'Data processing summary',
  lead: 'A plain summary of how we handle personal information on behalf of customers of the AI Front Desk. It is not the contract.',
  lastUpdated: '2026-10-22',
  sections: [
    {
      id: 'roles',
      heading: 'Roles',
      body: (
        <p>
          The customer is the controller of the information about its callers and WhatsApp users. IK
          Cloud Solutions is the processor and acts on the customer&rsquo;s documented instructions.
        </p>
      ),
    },
    {
      id: 'subject-matter',
      heading: 'Subject matter and duration',
      body: (
        <p>
          We process information to answer calls and messages for the customer for as long as the
          service runs.
        </p>
      ),
    },
    {
      id: 'data',
      heading: 'Categories of data',
      body: (
        <ul>
          <li>Voice recordings and transcripts.</li>
          <li>Phone numbers.</li>
          <li>WhatsApp messages and profile names.</li>
          <li>Appointment and enquiry details.</li>
        </ul>
      ),
    },
    {
      id: 'purpose',
      heading: 'Purpose limits, instructions and confidentiality',
      body: (
        <p>
          We use the information only to provide the service and for no other purpose. People who
          can access it are bound by confidentiality.
        </p>
      ),
    },
    {
      id: 'security',
      heading: 'Security measures',
      body: (
        <p>
          We apply appropriate technical and organisational measures. The{' '}
          <Link href="/security">security page</Link> says what is true today.
        </p>
      ),
    },
    {
      id: 'subprocessors',
      heading: 'Planned subprocessors, to be confirmed before launch',
      body: (
        <>
          <p>
            This list is a plan, not a commitment. We will tell customers before we add or replace a
            subprocessor.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <caption className="sr-only">Planned subprocessors</caption>
              <thead>
                <tr className="border-b border-white/15 text-white">
                  <th scope="col" className="py-2 pr-4">
                    Provider
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    Purpose
                  </th>
                  <th scope="col" className="py-2">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {subprocessors.map((item) => (
                  <tr key={item.name} className="border-b border-white/10 align-top">
                    <th scope="row" className="py-2 pr-4 font-semibold text-white">
                      {item.name}
                    </th>
                    <td className="py-2 pr-4">{item.purpose}</td>
                    <td className="py-2">{item.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'requests',
      heading: 'Help with data-subject requests',
      body: (
        <p>
          We help the customer respond to requests to access, correct or delete personal
          information.
        </p>
      ),
    },
    {
      id: 'deletion',
      heading: 'Deletion and return',
      body: (
        <p>
          At the end of the contract we delete or return the information. Our proposed default for
          call recordings is <Ph>90</Ph> days, configurable by the customer.
        </p>
      ),
    },
    {
      id: 'breach',
      heading: 'Breach notification and audit',
      body: (
        <p>
          We tell the customer without undue delay after becoming aware of a personal data breach,
          and we make the information needed to show compliance available on request.
        </p>
      ),
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      body: (
        <p>
          Where a subprocessor handles information outside the UK, a lawful transfer mechanism is
          used. <Ph>Solicitor to confirm</Ph>.
        </p>
      ),
    },
    {
      id: 'full-dpa',
      heading: 'The full agreement',
      body: <p>The full data processing agreement is provided on request or at order.</p>,
    },
  ],
};
