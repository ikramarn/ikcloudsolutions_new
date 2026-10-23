import Link from 'next/link';
import { Ph } from '@/components/legal/Placeholder';
import { siteConfig } from '@/config/site';
import type { LegalDocument } from '@/content/legal/types';

export const securityDocument: LegalDocument = {
  path: '/security',
  title: 'Security',
  lead: 'What we do today to protect this website and the information you send us, stated plainly.',
  lastUpdated: '2026-10-22',
  sections: [
    {
      id: 'today',
      heading: 'What is true today',
      body: (
        <ul>
          <li>The website is served over HTTPS.</li>
          <li>It is hosted on Vercel.</li>
          <li>Form submissions are validated on the server as well as in your browser.</li>
          <li>Forms are protected by Cloudflare Turnstile and rate limiting.</li>
          <li>We never handle payment card data on this website.</li>
          <li>Secrets are held as environment variables, not in the code.</li>
          <li>We collect the least information we need.</li>
        </ul>
      ),
    },
    {
      id: 'certification',
      heading: 'Certification',
      body: (
        <p>
          We do not currently hold ISO 27001, SOC 2 or Cyber Essentials certification. We will not
          describe the service as certified unless that changes.
        </p>
      ),
    },
    {
      id: 'breaches',
      heading: 'If something goes wrong',
      body: (
        <p>
          If a personal data breach occurs that is likely to put people at risk, we intend to tell
          the ICO within 72 hours where the law requires it, and to tell affected customers without
          undue delay. <Ph>Solicitor to confirm incident wording</Ph>.
        </p>
      ),
    },
    {
      id: 'reporting',
      heading: 'Reporting a vulnerability',
      body: (
        <p>
          If you think you have found a security problem, email{' '}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> with the details. Please do
          not access other people&rsquo;s information while testing.
        </p>
      ),
    },
    {
      id: 'related',
      heading: 'Related pages',
      body: (
        <p>
          See the <Link href="/privacy">privacy policy</Link> and the{' '}
          <Link href="/dpa-summary">DPA summary</Link> for how information is handled.
        </p>
      ),
    },
  ],
};
