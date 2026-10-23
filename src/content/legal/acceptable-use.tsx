import { Ph } from '@/components/legal/Placeholder';
import type { LegalDocument } from '@/content/legal/types';

export const acceptableUseDocument: LegalDocument = {
  path: '/acceptable-use',
  title: 'Acceptable use policy',
  lead: 'What you may and may not do with the AI Front Desk and our other services.',
  lastUpdated: '2026-10-22',
  sections: [
    {
      id: 'prohibited',
      heading: 'What is not allowed',
      body: (
        <ul>
          <li>Spam or unsolicited outbound messages and calls.</li>
          <li>Deception or impersonation, including pretending the AI is a person.</li>
          <li>Unlawful, harassing or abusive content.</li>
          <li>Regulated advice (medical, legal, financial) without proper safeguards.</li>
          <li>Use as an emergency service or to replace emergency contact routes.</li>
          <li>Cloning a voice without the written consent of the person it belongs to.</li>
          <li>
            Fraud, phishing or attempts to collect secrets such as passwords or payment details.
          </li>
          <li>Goods and services that WhatsApp&rsquo;s own policies prohibit.</li>
          <li>Attempts to get around platform or plan limits.</li>
        </ul>
      ),
    },
    {
      id: 'requirements',
      heading: 'What we require',
      body: (
        <ul>
          <li>AI and call-recording disclosure stays switched on.</li>
          <li>
            You hold lawful opt-in evidence for people you message and can show it on request.
          </li>
          <li>
            The service is used for your own business enquiries and is not a general-purpose
            chatbot.
          </li>
        </ul>
      ),
    },
    {
      id: 'enforcement',
      heading: 'What happens if the policy is broken',
      body: (
        <p>
          We may issue a warning, suspend the affected channel or end the contract, depending on how
          serious the breach is. Where the law or a platform requires it, we may report the matter.{' '}
          <Ph>Solicitor to confirm enforcement wording</Ph>.
        </p>
      ),
    },
  ],
};
