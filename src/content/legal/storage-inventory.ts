export interface StorageItem {
  item: string;
  where: string;
  purpose: string;
  category: string;
  setWhen: string;
}

/** Every item this website can store or request, shown on /cookies. Keep in step with the code. */
export const storageInventory: readonly StorageItem[] = [
  {
    item: 'ik_consent_v1',
    where: 'Browser local storage',
    purpose: 'Remembers your cookie choice',
    category: 'Strictly necessary',
    setWhen: 'After you make a choice',
  },
  {
    item: 'Cloudflare Turnstile',
    where: 'Request to cloudflare.com on form pages',
    purpose: 'Spam protection',
    category: 'Security (treated as strictly necessary; solicitor to confirm)',
    setWhen: 'When you focus a form field',
  },
  {
    item: 'Google Maps',
    where: 'Embedded map on the contact page',
    purpose: 'Shows a map',
    category: 'Third-party content',
    setWhen: 'Only after you press "Load map"',
  },
  {
    item: 'ik_academy_progress_v1, ik_academy_courses_v1',
    where: 'Browser local storage',
    purpose: 'Saves your demo progress and edited demo courses in your browser',
    category: 'Functional, started by you',
    setWhen: 'Only after you act in the Academy demo',
  },
];
