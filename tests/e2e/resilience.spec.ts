import { expect, test, type Page } from './helpers';
import { collectErrors } from './support';

// Amendment A6: browsers that block storage (some privacy modes, embedded views) make
// localStorage and sessionStorage throw on access. The site must still render.
async function blockStorage(page: Page) {
  await page.addInitScript(() => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    Object.defineProperty(window, 'localStorage', { get: blocked, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { get: blocked, configurable: true });
  });
}

test.describe('storage blocked (A6)', () => {
  test('the home page renders, the banner shows and Reject works in memory', async ({ page }) => {
    const errors = collectErrors(page);
    await blockStorage(page);
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');

    // Prove the block is real, otherwise this test would pass for the wrong reason.
    const access = await page.evaluate(() => {
      try {
        void window.localStorage;
        void window.sessionStorage;
        return 'available';
      } catch {
        return 'blocked';
      }
    });
    expect(access).toBe('blocked');

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Something went wrong' })).toHaveCount(0);
    const banner = page.getByRole('region', { name: 'Cookie preferences' });
    await expect(banner).toBeVisible();

    // The choice cannot be saved, but it is honoured for the rest of the session.
    await page.getByRole('button', { name: 'Reject non-essential' }).click();
    await expect(banner).toBeHidden();
    expect(errors).toEqual([]);
  });

  for (const path of ['/contact', '/ai-agents/pricing', '/ai-agents/get-started']) {
    test(`${path} still renders without an error boundary`, async ({ page }) => {
      const errors = collectErrors(page);
      await blockStorage(page);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { name: 'Something went wrong' })).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }

  test('the Academy demo still loads its catalogue', async ({ page }) => {
    const errors = collectErrors(page);
    await blockStorage(page);
    await page.goto('/academy');
    await expect(page.getByRole('heading', { name: 'Sample courses' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Something went wrong' })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
