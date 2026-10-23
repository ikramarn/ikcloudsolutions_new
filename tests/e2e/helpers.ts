import { randomInt } from 'node:crypto';
import { expect, test as base } from '@playwright/test';

const octet = () => randomInt(1, 255);

// The fixture callback is named `provide` instead of Playwright's usual `use` because
// react-hooks/rules-of-hooks mistakes `use(...)` for the React hook.
export const test = base.extend<{ clientIp: string }>({
  // A fresh rate-limit bucket for EVERY test execution: each test, retry, project and re-run.
  clientIp: async ({}, provide) => {
    await provide(`10.${octet()}.${octet()}.${octet()}`);
  },
  // Overrides the built-in option so page.goto/fetch, context.request and `request` all send it.
  extraHTTPHeaders: async ({ clientIp }, provide) => {
    await provide({ 'x-forwarded-for': clientIp });
  },
});

export { expect };
export type { APIRequestContext, Page } from '@playwright/test';
