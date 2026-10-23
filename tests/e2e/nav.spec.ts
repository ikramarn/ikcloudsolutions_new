import { getStartedHref } from '@/config/links';
import { HEADER_CTA_LABEL } from '@/config/navigation';
import { expect, test } from './helpers';
import { preDecideConsent } from './support';

// The primary navigation switches to a drawer below the lg breakpoint (1024px).
const isDesktop = (width: number | undefined) => (width ?? 0) >= 1024;

test.describe('desktop navigation', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isDesktop(page.viewportSize()?.width), 'desktop layout only');
    await preDecideConsent(page);
  });

  test('the AI Agents menu works by keyboard and Escape returns focus', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    const trigger = nav.getByRole('button', { name: /AI Agents/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panelId = await trigger.getAttribute('aria-controls');
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: /^Pricing/ })).toBeVisible();

    // Tab moves into the panel's links.
    await page.keyboard.press('Tab');
    await expect(panel.getByRole('link').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    await expect(panel).toBeHidden();
  });

  test('the menu lists every AI Front Desk page and the industries', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.getByRole('button', { name: /AI Agents/ }).click();
    for (const name of [
      'Overview',
      'Voice',
      'WhatsApp',
      'Websites',
      'Done-for-you',
      'How it works',
      'Pricing',
      'Clinics',
      'Estate agents',
      'Home services',
    ]) {
      await expect(
        page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
          name: new RegExp(`^${name}`),
        }),
      ).toBeVisible();
    }
  });

  test('NEW and DEMO badges are shown', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('button', { name: /AI Agents/ })).toContainText('NEW');
    await expect(nav.getByRole('link', { name: /Academy/ })).toContainText('DEMO');
  });

  test('the header call to action points at getStartedHref()', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('banner').getByRole('link', { name: HEADER_CTA_LABEL });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', getStartedHref());
    await cta.click();
    await expect(page).toHaveURL(/\/ai-agents\/get-started/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Request your AI Front Desk');
  });
});

test.describe('mobile drawer', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(isDesktop(page.viewportSize()?.width), 'mobile layout only');
    await preDecideConsent(page);
  });

  test('opens, shows the same links, closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/');
    const opener = page.getByRole('button', { name: 'Open menu' });
    await opener.click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(drawer.getByText('NEW')).toBeVisible();
    await expect(drawer.getByRole('link', { name: HEADER_CTA_LABEL })).toHaveAttribute(
      'href',
      getStartedHref(),
    );

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('following a link navigates and closes the drawer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await drawer.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/\/ai-agents\/pricing$/);
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
  });
});
