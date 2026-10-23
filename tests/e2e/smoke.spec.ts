import { expect, test } from './helpers';

test('home page responds 200 with exactly one h1', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('shell renders the skip link and the cookie banner', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeAttached();
  await expect(page.getByRole('region', { name: 'Cookie preferences' })).toBeVisible();
});
