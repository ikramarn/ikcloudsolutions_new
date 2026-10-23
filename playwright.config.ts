import { defineConfig, devices } from '@playwright/test';
const APP_PORT = 3100;
// A second build of the site made WITH a Turnstile site key (NEXT_PUBLIC_* values are inlined at
// build time), used only by tests/e2e/turnstile.spec.ts. It builds into its own distDir so the two
// builds never overwrite each other.
const TURNSTILE_PORT = 3101;
const STUB_PORT = 3199;
// Cloudflare's published always-pass site key for testing. It is not a secret.
const CLOUDFLARE_TEST_SITE_KEY = '1x00000000000000000000AA';
const TURNSTILE_SPEC = /turnstile\.spec\.ts$/;

const appEnv = {
  RESEND_API_KEY: 're_test_stub',
  RESEND_BASE_URL: `http://localhost:${STUB_PORT}`,
  LEAD_TO_EMAIL: 'owner@example.test',
  LEAD_FROM_EMAIL: 'IK Leads <leads@example.test>',
};

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
      testIgnore: TURNSTILE_SPEC,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      testIgnore: TURNSTILE_SPEC,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'turnstile',
      testMatch: TURNSTILE_SPEC,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        baseURL: `http://localhost:${TURNSTILE_PORT}`,
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
        ...appEnv,
        NEXT_PUBLIC_SITE_URL: `http://localhost:${APP_PORT}`,
      },
    },
    {
      command: `npm run build && npm run start -- -p ${TURNSTILE_PORT}`,
      url: `http://localhost:${TURNSTILE_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        ...appEnv,
        NEXT_DIST_DIR: '.next-turnstile',
        NEXT_PUBLIC_SITE_URL: `http://localhost:${TURNSTILE_PORT}`,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: CLOUDFLARE_TEST_SITE_KEY,
      },
    },
  ],
});
