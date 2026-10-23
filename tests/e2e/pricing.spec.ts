import { pricingConfig } from '@/config/pricing';
import { displayUnitRate, priceIn } from '@/lib/money';
import { expect, test, type Page } from './helpers';
import { preDecideConsent } from './support';

// Criterion 12 numbers (net prices, VAT shown as a separate note): monthly, then annual per month,
// billed once a year, and the saving against twelve monthly payments.
const MONTHLY = { Starter: '£79', Pro: '£249', Premium: '£649' } as const;
const ANNUAL = {
  Starter: { perMonth: '£71.10', billed: '£853.20', saving: '£94.80' },
  Pro: { perMonth: '£224.10', billed: '£2,689.20', saving: '£298.80' },
  Premium: { perMonth: '£584.10', billed: '£7,009.20', saving: '£778.80' },
} as const;
const ALLOWANCES = {
  Starter: { voice: '200', whatsapp: '1,000' },
  Pro: { voice: '500', whatsapp: '5,000' },
  Premium: { voice: '1,200', whatsapp: '12,000' },
} as const;
const PLANS = ['Starter', 'Pro', 'Premium'] as const;

const card = (page: Page, plan: (typeof PLANS)[number]) =>
  page.getByRole('list', { name: `${plan} allowances` }).locator('xpath=ancestor::li[1]');

test.beforeEach(async ({ page }) => {
  await preDecideConsent(page);
  await page.goto('/ai-agents/pricing');
  await page.waitForLoadState('networkidle');
});

test('monthly prices match the pricing config figures', async ({ page }) => {
  for (const plan of PLANS) {
    await expect(card(page, plan)).toContainText(MONTHLY[plan]);
    await expect(card(page, plan)).toContainText('a month');
  }
});

test('annual prices, billed totals and savings match', async ({ page }) => {
  await page.getByText(`Annual, save ${pricingConfig.annualDiscountPercent}%`).click();
  for (const plan of PLANS) {
    const { perMonth, billed, saving } = ANNUAL[plan];
    await expect(card(page, plan)).toContainText(perMonth);
    await expect(card(page, plan)).toContainText(billed);
    await expect(card(page, plan)).toContainText(saving);
  }
  await page.getByText('Monthly', { exact: true }).click();
  await expect(card(page, 'Starter')).toContainText(MONTHLY.Starter);
});

test('voice minutes and WhatsApp replies are two separate rows, never combined', async ({
  page,
}) => {
  for (const plan of PLANS) {
    const rows = page.getByRole('list', { name: `${plan} allowances` }).getByRole('listitem');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(`Voice minutes: ${ALLOWANCES[plan].voice} a month`);
    await expect(rows.nth(1)).toContainText(
      `AI WhatsApp replies: ${ALLOWANCES[plan].whatsapp} a month`,
    );
  }
});

test('overage rates come from the config in the current VAT mode', async ({ page }) => {
  const table = page.getByRole('table').filter({ hasText: 'Usage above your allowance' });
  const { currency, vat, plans } = pricingConfig;
  const voice = table.getByRole('row').filter({ hasText: 'Each extra voice minute' });
  const whatsapp = table.getByRole('row').filter({ hasText: 'Each extra AI WhatsApp reply' });
  for (const [index, plan] of plans.entries()) {
    await expect(voice.getByRole('cell').nth(index)).toHaveText(
      displayUnitRate(priceIn(plan.overage.voicePerMinuteTenthsPence, currency), vat),
    );
    await expect(whatsapp.getByRole('cell').nth(index)).toHaveText(
      displayUnitRate(priceIn(plan.overage.whatsappPerReplyTenthsPence, currency), vat),
    );
  }
});

test('the Meta fees note links to Meta and quotes no rate', async ({ page }) => {
  const note = page.locator('aside').filter({ hasText: 'charged by Meta' });
  await expect(note).toHaveCount(1);
  const link = note.getByRole('link', { name: /Meta/ });
  await expect(link).toHaveAttribute('href', pricingConfig.metaPricingUrl);
  await expect(link).toHaveAttribute('rel', /noopener/);
  const text = (await note.textContent()) ?? '';
  expect(text).not.toMatch(/\d/);
  expect(text).not.toMatch(/[£$€]/);
});
