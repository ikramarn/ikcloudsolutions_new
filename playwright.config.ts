import { defineConfig, devices } from '@playwright/test';

const APP_PORT = 3100;
const STUB_PORT = 3199;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: 'node tests/e2e/resend-stub.mjs',
      url: `http://localhost:${STUB_PORT}/__last`,
      reuseExistingServer: !process.env.CI,
      env: { STUB_PORT: String(STUB_PORT) },
    },
    {
      command: `npm run build && npm run start -- -p ${APP_PORT}`,
      url: `http://localhost:${APP_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        NEXT_PUBLIC_SITE_URL: `http://localhost:${APP_PORT}`,
        RESEND_API_KEY: 're_test_stub',
        RESEND_BASE_URL: `http://localhost:${STUB_PORT}`,
        LEAD_TO_EMAIL: 'owner@example.test',
        LEAD_FROM_EMAIL: 'IK Leads <leads@example.test>',
      },
    },
  ],
});
