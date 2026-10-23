import { cookiesAnalyticsCopy } from '@/components/consent/copy';
import { CookieSettings } from '@/components/consent/CookieSettings';
import { ScrollRegion } from '@/components/ui/ScrollRegion';
import type { LegalDocument } from '@/content/legal/types';
import { storageInventory } from '@/content/legal/storage-inventory';

/** A function of analytics.enabled so the analytics sentence can never overstate what runs. */
export function cookiesDocument(analyticsEnabled: boolean): LegalDocument {
  return {
    path: '/cookies',
    title: 'Cookies and browser storage',
    lead: 'Everything this website stores in your browser or asks a third party for, and how to change your choice.',
    lastUpdated: '2026-10-22',
    sections: [
      {
        id: 'analytics',
        heading: 'Analytics',
        body: <p>{cookiesAnalyticsCopy(analyticsEnabled)}</p>,
      },
      {
        id: 'inventory',
        heading: 'What is stored',
        body: (
          <ScrollRegion label="Items stored by this website">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">Items stored by this website</caption>
              <thead>
                <tr className="border-b border-white/15 text-white">
                  <th scope="col" className="py-2 pr-4">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    Where
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    Purpose
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    Category
                  </th>
                  <th scope="col" className="py-2">
                    Set when
                  </th>
                </tr>
              </thead>
              <tbody>
                {storageInventory.map((row) => (
                  <tr key={row.item} className="border-b border-white/10 align-top">
                    <th scope="row" className="py-2 pr-4 font-semibold break-words text-white">
                      {row.item}
                    </th>
                    <td className="py-2 pr-4">{row.where}</td>
                    <td className="py-2 pr-4">{row.purpose}</td>
                    <td className="py-2 pr-4">{row.category}</td>
                    <td className="py-2">{row.setWhen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        ),
      },
      {
        id: 'controls',
        heading: 'Change or withdraw your choice',
        body: (
          <>
            <p>
              You can change your choice at any time. This reopens the cookie banner so you can
              choose again.
            </p>
            <p>
              <CookieSettings className="inline-flex min-h-11 items-center rounded-xl border border-white/15 bg-white/5 px-5 font-semibold text-slate-100 hover:bg-white/10" />
            </p>
          </>
        ),
      },
      {
        id: 'third-parties',
        heading: 'Third parties',
        body: (
          <p>
            Cloudflare Turnstile is contacted when you use a form, to check you are a person. The
            Google Maps embed on the contact page loads only after you press &ldquo;Load map&rdquo;,
            and Google may set its own cookies when it does.
          </p>
        ),
      },
    ],
  };
}
