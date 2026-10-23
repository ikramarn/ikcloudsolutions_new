import Link from 'next/link';
import { Ph } from '@/components/legal/Placeholder';
import { siteConfig } from '@/config/site';
import type { LegalDocument } from '@/content/legal/types';

const { address } = siteConfig;

export const privacyDocument: LegalDocument = {
  path: '/privacy',
  title: 'Privacy policy',
  lead: 'How IK Cloud Solutions collects, uses and protects personal information when you use this website or send us an enquiry.',
  lastUpdated: '2026-10-22',
  sections: [
    {
      id: 'who-we-are',
      heading: 'Who we are',
      body: (
        <>
          <p>
            {siteConfig.legalName ?? siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is the
            controller of the personal information described in this policy. Our address is{' '}
            {address.street}, {address.locality}, {address.postalCode}, {address.countryName}. You
            can contact us at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>
          <p>
            Company number: <Ph>Companies House number</Ph>. ICO registration number:{' '}
            <Ph>ICO registration number</Ph>.
          </p>
        </>
      ),
    },
    {
      id: 'what-we-collect',
      heading: 'What we collect',
      body: (
        <>
          <ul>
            <li>
              <strong>Enquiry forms:</strong> the contact form and consultation request collect your
              name, email address, the message you write and the service you are interested in.
            </li>
            <li>
              <strong>Intake form:</strong> the AI Front Desk request form collects business
              details, the channels and plan you are considering, and your contact details.
            </li>
            <li>
              <strong>Technical logs:</strong> our hosting platform may record IP addresses, browser
              details and request times for security and reliability.
            </li>
            <li>
              <strong>Consent record:</strong> your cookie choice is saved in your own browser so we
              can honour it.
            </li>
            <li>
              <strong>Academy demo:</strong> progress and any courses you edit in the demo stay in
              your browser. They are not sent to us.
            </li>
          </ul>
          <p>
            We do not ask for payment card details on this website and we do not collect passwords.
          </p>
        </>
      ),
    },
    {
      id: 'lawful-bases',
      heading: 'Why we use it and our lawful bases',
      body: (
        <ul>
          <li>
            To reply to your enquiry and prepare a quote: steps taken at your request before a
            contract, and our legitimate interests in running a consultancy.
          </li>
          <li>
            To keep the website secure and prevent spam: our legitimate interests (spam checks, rate
            limiting and security logs).
          </li>
          <li>To remember your cookie choice: needed to respect that choice.</li>
          <li>
            For marketing messages and any optional analytics: your consent, which you can withdraw
            at any time.
          </li>
        </ul>
      ),
    },
    {
      id: 'recipients',
      heading: 'Who we share it with',
      body: (
        <>
          <p>We use a small number of providers to run this website. They act as our processors:</p>
          <ul>
            <li>Vercel, which hosts the website.</li>
            <li>Resend, which sends the email that delivers your enquiry to us.</li>
            <li>Cloudflare Turnstile, which checks that form submissions come from a person.</li>
            <li>Hostinger, which provides our business mailboxes.</li>
          </ul>
          <p>We do not sell personal information.</p>
        </>
      ),
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      body: (
        <p>
          Some providers process data outside the UK. Where they do, we rely on an adequacy decision
          or the UK International Data Transfer Agreement or Addendum. <Ph>Solicitor to confirm</Ph>
          .
        </p>
      ),
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      body: (
        <p>
          We keep enquiries for <Ph>12</Ph> months after our last contact unless a contract or the
          law requires us to keep them longer. Platform logs are kept for the period set by the
          provider.
        </p>
      ),
    },
    {
      id: 'rights',
      heading: 'Your rights',
      body: (
        <>
          <p>
            Under UK data protection law you can ask us to access, correct, delete or restrict your
            information, to object to our use of it, and to move it to another provider. You can
            withdraw consent at any time. Email{' '}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> to exercise a right.
          </p>
          <p>
            You can complain to the Information Commissioner&rsquo;s Office (ICO) at ico.org.uk. We
            would appreciate the chance to put things right first.
          </p>
        </>
      ),
    },
    {
      id: 'cookies',
      heading: 'Cookies and browser storage',
      body: (
        <p>
          The list of items stored in your browser and the controls to change your choice are on the{' '}
          <Link href="/cookies">cookies page</Link>.
        </p>
      ),
    },
    {
      id: 'children',
      heading: 'Children',
      body: <p>This website is for businesses and is not aimed at children.</p>,
    },
    {
      id: 'processor',
      heading: 'When we act as your processor',
      body: (
        <p>
          If we provide the AI Front Desk to your business, we handle your callers&rsquo; and
          customers&rsquo; information on your behalf. In that case we are your processor and you
          are the controller. See the <Link href="/dpa-summary">DPA summary</Link>.
        </p>
      ),
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      body: <p>We will update the date above when this policy changes.</p>,
    },
  ],
};
