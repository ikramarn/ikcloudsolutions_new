import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './helpers';

// Acceptance criterion 23: no serious or critical axe violations on these six pages, with the
// cookie banner showing (the state a first-time visitor sees).
const PAGES = [
  '/',
  '/ai-agents',
  '/ai-agents/pricing',
  '/ai-agents/get-started',
  '/contact',
  '/cookies',
] as const;

for (const path of PAGES) {
  test(`axe: no serious or critical issues on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'Cookie preferences' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );
    expect(
      blocking.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.slice(0, 5).map((node) => node.target.join(' ')),
      })),
    ).toEqual([]);
  });
}

test('axe: the consultation dialog has no serious or critical issues', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Reject non-essential' }).click();
  const opener = page.getByRole('banner').getByRole('button', { name: 'Book a consultation' });
  if (await opener.isVisible()) {
    await opener.click();
  } else {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page
      .getByRole('dialog', { name: 'Menu' })
      .getByRole('button', { name: 'Book a consultation' })
      .click();
  }
  const dialog = page.getByRole('dialog', { name: 'Book a consultation' });
  await expect(dialog).toBeVisible();
  const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(blocking.map((violation) => violation.id)).toEqual([]);
});
