import { Check, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const INCLUDED = [
  'Building and testing your agent',
  'Hosting and monitoring',
  'A UK number, new or forwarded',
  'Handover rules agreed with you',
  'A summary of each conversation by email',
  'A monthly review',
] as const;

const NOT_INCLUDED = [
  'WhatsApp message fees, which Meta charges you directly',
  'Telephony to non-UK numbers beyond your plan',
  'Outbound calling',
  'Legal, clinical or financial advice',
  'Work beyond the change hours in your plan',
] as const;

/** Two lists. Headings are h3: the surrounding Section provides the h2. */
export function IncludedList() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <h3 className="text-lg font-bold text-white">What is included</h3>
        <ul className="mt-3 space-y-2">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-200">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-emerald-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3 className="text-lg font-bold text-white">What is not included</h3>
        <ul className="mt-3 space-y-2">
          {NOT_INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-200">
              <X aria-hidden="true" className="mt-1 size-5 shrink-0 text-rose-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
