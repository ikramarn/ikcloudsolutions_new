import { expect, test } from './helpers';
import { ALLOWED_STORAGE_KEYS, CONSENT_KEY, ORIGIN } from './support';

const FIRST_LOAD_PATHS = ['/', '/ai-agents', '/ai-agents/pricing', '/contact'] as const;

test.describe('first visit', () => {
  for (const path of FIRST_LOAD_PATHS) {
    test(`${path} sets no cookies, stores nothing unexpected and calls no third party`, async ({
      page,
      context,
    }) => {
      const external: string[] = [];
      page.on('request', (request) => {
        const url = new URL(request.url());
        if (/^https?:$/.test(url.protocol) && url.origin !== ORIGIN) external.push(request.url());
      });

      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Give lazy islands and idle callbacks a moment to misbehave.
      await page.waitForTimeout(1000);

      expect(await context.cookies()).toEqual([]);
      const keys = await page.evaluate(() => Object.keys(window.localStorage));
      for (const key of keys) {
        expect(ALLOWED_STORAGE_KEYS as readonly string[], `unexpected key ${key}`).toContain(key);
      }
      // Nothing is stored before a choice has been made.
      expect(keys).not.toContain(CONSENT_KEY);
      expect(external).toEqual([]);
    });
  }
});

test.describe('cookie banner and the map', () => {
  test('the map iframe is absent until "Load map" is pressed', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reject non-essential' }).click();
    await page.getByRole('button', { name: 'Load map' }).click();
    const frame = page.locator('iframe[title^="Map showing"]');
    await expect(frame).toHaveCount(1);
    expect(await frame.getAttribute('src')).toContain('google.com/maps/embed');
  });

  test('Reject persists after a reload and the footer link reopens the banner', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    const banner = page.getByRole('region', { name: 'Cookie preferences' });
    await expect(banner).toBeVisible();
    await page.getByRole('button', { name: 'Reject non-essential' }).click();
    await expect(banner).toBeHidden();

    const stored = await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_KEY);
    expect(JSON.parse(stored ?? 'null')).toMatchObject({ version: 1, analytics: false });
    expect(await context.cookies()).toEqual([]);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(banner).toBeHidden();

    await page.getByRole('button', { name: 'Cookie settings' }).click();
    await expect(banner).toBeVisible();
  });

  test('accepting is also remembered and still sets no cookies', async ({ page, context }) => {
    const external: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (/^https?:$/.test(url.protocol) && url.origin !== ORIGIN) external.push(request.url());
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Accept analytics' }).click();
    await expect(page.getByRole('region', { name: 'Cookie preferences' })).toBeHidden();
    const stored = await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_KEY);
    expect(JSON.parse(stored ?? 'null')).toMatchObject({ version: 1, analytics: true });
    // No analytics provider is configured, so accepting must not cause any third-party request.
    await page.waitForTimeout(500);
    expect(external).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });
});
