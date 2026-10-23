import { getScenario } from '@/content/agents/demos';
import { expect, test, type Page } from './helpers';
import { preDecideConsent } from './support';

const OWNER_SUMMARY = 'What the owner receives (example)';

async function openDemo(page: Page, path: string, title: string) {
  await preDecideConsent(page);
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();
  // The log region outlives a change of scenario, so this locator stays valid after branching.
  return page
    .getByRole('log', { name: 'Simulated conversation' })
    .locator('xpath=ancestor::div[contains(@class,"glass-panel")][1]');
}

test.describe('simulated demos by keyboard', () => {
  test('the voice demo plays to the end with the keyboard alone', async ({ page }) => {
    test.setTimeout(120_000);
    const widget = await openDemo(page, '/ai-agents/voice', 'A call to a small business');
    await expect(widget.getByText('Simulated', { exact: true })).toBeVisible();
    await expect(widget).toContainText('No audio is played');
    await expect(widget.locator('audio, video')).toHaveCount(0);

    const play = widget.getByRole('button', { name: 'Play' });
    await play.focus();
    await page.keyboard.press('Enter');
    await expect(widget.getByRole('button', { name: 'Pause' })).toBeVisible();

    await expect(widget.getByRole('heading', { name: OWNER_SUMMARY })).toBeVisible({
      timeout: 90_000,
    });
    const scenario = getScenario('general-voice');
    await expect(widget.getByRole('log').getByRole('listitem')).toHaveCount(
      scenario?.turns.length ?? -1,
    );
    await expect(widget.getByRole('button', { name: 'Play' })).toBeDisabled();
  });

  test('the WhatsApp demo can be finished from the keyboard and branches to an example', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const widget = await openDemo(
      page,
      '/ai-agents/whatsapp',
      'A WhatsApp enquiry to a small business',
    );
    await expect(widget.getByText('Simulated', { exact: true })).toBeVisible();

    // Skip to the end: Tab-reachable "Show full transcript" activated with the keyboard.
    const showAll = widget.getByRole('button', { name: 'Show full transcript' });
    await showAll.focus();
    await page.keyboard.press('Enter');
    await expect(widget.getByRole('heading', { name: OWNER_SUMMARY })).toBeVisible();

    const quickReplies = widget.getByRole('list').last().getByRole('button');
    await expect(quickReplies).toHaveCount(3);
    const dental = widget.getByRole('button', { name: 'See a dental practice example' });
    await dental.focus();
    await page.keyboard.press('Enter');
    await expect(widget.getByRole('heading', { level: 3 })).not.toHaveText(
      'A WhatsApp enquiry to a small business',
    );
    await expect(widget.getByText('Meadowbank Dental Practice').first()).toBeVisible();
    await expect(widget.locator('audio, video')).toHaveCount(0);
  });
});

test.describe('reduced motion', () => {
  for (const [path, id, title] of [
    ['/ai-agents/voice', 'general-voice', 'A call to a small business'],
    ['/ai-agents/whatsapp', 'general-whatsapp', 'A WhatsApp enquiry to a small business'],
  ] as const) {
    test(`${path} shows the whole transcript at once`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const widget = await openDemo(page, path, title);
      const scenario = getScenario(id);
      await expect(widget.getByRole('log').getByRole('listitem')).toHaveCount(
        scenario?.turns.length ?? -1,
      );
      await expect(widget.getByRole('heading', { name: OWNER_SUMMARY })).toBeVisible();
      await expect(widget.getByRole('button', { name: 'Play' })).toBeDisabled();
      await expect(widget.getByRole('button', { name: 'Restart' })).toBeDisabled();
      await expect(widget.getByRole('button', { name: 'Show full transcript' })).toHaveCount(0);
    });
  }
});
