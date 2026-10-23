import { randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type Page } from './helpers';
import {
  ORIGIN,
  STUB_ORIGIN,
  collectErrors,
  contactPayload,
  forbiddenInputCount,
  preDecideConsent,
} from './support';

const SITE_EMAIL = 'admin@ikcloudsolutions.com';
const marker = () => `E2E-${randomUUID()}`;

interface StubEntry {
  headers: Record<string, string | string[] | undefined>;
  raw: string;
  payload: Record<string, unknown> | null;
}

/** Waits for the Resend stub to receive the email that contains `needle`. */
async function findInStub(request: APIRequestContext, needle: string): Promise<StubEntry> {
  let entry: StubEntry | null = null;
  await expect
    .poll(
      async () => {
        const response = await request.get(`${STUB_ORIGIN}/__find?q=${encodeURIComponent(needle)}`);
        if (response.status() !== 200) return false;
        entry = (await response.json()) as StubEntry;
        return true;
      },
      { timeout: 10_000 },
    )
    .toBe(true);
  if (!entry) throw new Error('stub entry missing');
  return entry;
}

async function stubHasNothingFor(request: APIRequestContext, needle: string): Promise<boolean> {
  const response = await request.get(`${STUB_ORIGIN}/__find?q=${encodeURIComponent(needle)}`);
  return response.status() === 404;
}

async function fillContactForm(page: Page, message: string) {
  await page.getByLabel('First name').fill('Test');
  await page.getByLabel('Last name').fill('Person');
  await page.getByLabel('Email').fill('test.person@example.test');
  await page.getByLabel('Subject').fill('E2E enquiry');
  await page.getByLabel('What is this about?').selectOption('AI Front Desk');
  await page.getByLabel('Message').fill(message);
}

async function openContact(page: Page) {
  await preDecideConsent(page);
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
}

test.describe('contact form', () => {
  test('succeeds through the real handler and the Resend stub', async ({ page, request }) => {
    const id = marker();
    await openContact(page);
    await fillContactForm(page, `Automated test message ${id}`);
    await page.getByRole('button', { name: 'Send message' }).click();

    const success = page.getByRole('status').filter({ hasText: 'Thank you, we have your message' });
    await expect(success).toBeVisible();
    await expect(success).toContainText(/Your reference is\s+IK-[A-Z0-9]+/);

    const sent = await findInStub(request, id);
    const body = sent.payload ?? {};
    expect(body.reply_to ?? body.replyTo).toContain('test.person@example.test');
    // No raw CR/LF in any header-bearing field.
    for (const field of ['subject', 'from', 'to', 'reply_to', 'replyTo']) {
      expect(JSON.stringify(body[field] ?? ''), field).not.toMatch(/\\r|\\n/);
    }
    expect(String(sent.headers['idempotency-key'] ?? '')).toMatch(/^IK-[A-Z0-9]+:[0-9a-f]{16}$/);
  });

  test('a delivery failure shows the error and the mailto fallback, never success', async ({
    page,
  }) => {
    const message = `Please fail this one [force-fail] ${marker()}`;
    await openContact(page);
    await fillContactForm(page, message);
    const responsePromise = page.waitForResponse('**/api/lead');
    await page.getByRole('button', { name: 'Send message' }).click();
    expect((await responsePromise).status()).toBe(502);

    const alert = page.getByRole('alert').filter({ hasText: SITE_EMAIL });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole('link', { name: SITE_EMAIL })).toHaveAttribute(
      'href',
      `mailto:${SITE_EMAIL}`,
    );
    await expect(page.getByText('Thank you, we have your message')).toHaveCount(0);
    // Everything the visitor typed is still there.
    await expect(page.getByLabel('Message')).toHaveValue(message);
    await expect(page.getByLabel('Email')).toHaveValue('test.person@example.test');
  });

  test('a mocked 502 shows the error state and keeps the values', async ({ page }) => {
    await page.route('**/api/lead', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: { code: 'delivery_failed', message: 'Mock failure.', reference: 'IK-ABCDEFGH' },
        }),
      }),
    );
    await openContact(page);
    await fillContactForm(page, 'A message that will not be delivered.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Mock failure.' })).toBeVisible();
    await expect(page.getByRole('link', { name: SITE_EMAIL }).first()).toBeVisible();
    await expect(page.getByText('Thank you, we have your message')).toHaveCount(0);
    await expect(page.getByLabel('Subject')).toHaveValue('E2E enquiry');
  });

  test('a network failure shows the error state', async ({ page }) => {
    await page.route('**/api/lead', (route) => route.abort('failed'));
    await openContact(page);
    await fillContactForm(page, 'A message lost on the way.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('alert').filter({ hasText: SITE_EMAIL })).toBeVisible();
    await expect(page.getByText('Thank you, we have your message')).toHaveCount(0);
  });

  test('client-side validation lists what is missing', async ({ page }) => {
    await openContact(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Please check the following' });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('First name');
    await expect(alert).toContainText('Email');
    await expect(alert).toContainText('Message');
    await expect(alert).toBeFocused();
  });
});

test.describe('POST /api/lead directly', () => {
  const headers = { Origin: ORIGIN, 'Content-Type': 'application/json' };

  test('a filled honeypot is rejected with 400 and nothing is sent', async ({ request }) => {
    const id = marker();
    const response = await request.post('/api/lead', {
      headers,
      data: contactPayload({ hp_confirm_ref: 'https://spam.example', message: `Spam ${id} body` }),
    });
    expect(response.status()).toBe(400);
    const body = (await response.json()) as { ok?: boolean; error?: { code?: string } };
    expect(body.ok).not.toBe(true);
    expect(body.error?.code).toBe('rejected');
    expect(await stubHasNothingFor(request, id)).toBe(true);
  });

  test('a foreign Origin is refused with 403 and no CORS allowance', async ({ request }) => {
    const id = marker();
    const response = await request.post('/api/lead', {
      headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
      data: contactPayload({ message: `Cross-site ${id} body` }),
    });
    expect(response.status()).toBe(403);
    expect(response.headers()['access-control-allow-origin']).toBeUndefined();
    expect(await stubHasNothingFor(request, id)).toBe(true);
  });

  test('a request without an Origin is refused', async ({ request }) => {
    const response = await request.post('/api/lead', {
      headers: { 'Content-Type': 'application/json' },
      data: contactPayload(),
    });
    expect(response.status()).toBe(403);
  });

  test('the 6th rapid post from one address is rate limited', async ({ request }) => {
    const statuses: number[] = [];
    let retryAfter: string | undefined;
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const response = await request.post('/api/lead', {
        headers,
        data: contactPayload({ message: `Rate limit probe ${attempt} ${marker()}` }),
      });
      statuses.push(response.status());
      if (attempt === 6) retryAfter = response.headers()['retry-after'];
    }
    expect(statuses.slice(0, 5)).not.toContain(429);
    expect(statuses[5]).toBe(429);
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });
});

test.describe('consultation dialog', () => {
  async function openConsultation(page: Page) {
    const header = page.getByRole('banner').getByRole('button', { name: 'Book a consultation' });
    if (await header.isVisible()) {
      await header.click();
    } else {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page
        .getByRole('dialog', { name: 'Menu' })
        .getByRole('button', { name: 'Book a consultation' })
        .click();
    }
  }

  test('opens and closes ten times without console errors', async ({ page }) => {
    const errors = collectErrors(page);
    await preDecideConsent(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const dialog = page.getByRole('dialog', { name: 'Book a consultation' });
    for (let round = 1; round <= 10; round += 1) {
      await openConsultation(page);
      await expect(dialog, `round ${round}`).toBeVisible();
      if (round === 1) {
        await expect(dialog.getByLabel('Name')).toBeVisible();
        expect(await forbiddenInputCount(page)).toBe(0);
      }
      await page.keyboard.press('Escape');
      await expect(dialog, `round ${round} closed`).toBeHidden();
    }
    expect(errors).toEqual([]);
  });
});

test.describe('AI Front Desk request (intake wizard)', () => {
  async function ready(page: Page, query = '') {
    await preDecideConsent(page);
    await page.goto(`/ai-agents/get-started${query}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Request your AI Front Desk');
  }

  const next = (page: Page) => page.getByRole('button', { name: 'Next', exact: true }).click();
  const estimate = (page: Page) => page.getByRole('region', { name: 'Your estimate' });

  async function completeBusinessStep(page: Page) {
    await page.getByLabel('Business name').fill('Meadowbank Test Dental');
    await page.getByText('Private or dental clinic').click();
    await next(page);
  }

  test('validates each step, shows live estimates and sends the request', async ({
    page,
    request,
  }) => {
    const id = marker();
    const errors = collectErrors(page);
    await ready(page);

    // Step 1: the first Next with nothing filled lists what is missing.
    await next(page);
    const summary = page.getByRole('alert').filter({ hasText: 'Please check the following' });
    await expect(summary).toContainText('Business name');
    await expect(summary).toContainText('Industry');
    await completeBusinessStep(page);

    // Step 2: a channel is required.
    await expect(page.getByRole('heading', { level: 2, name: 'Channels' })).toBeVisible();
    await next(page);
    await expect(
      page.getByRole('alert').filter({ hasText: 'Please check the following' }),
    ).toBeVisible();
    await page.getByText('Voice: an AI receptionist for phone calls').click();
    await next(page);

    // Step 3: Starter, monthly. No setup fee yet, so the first payment is the plan alone.
    await page.getByText('Starter', { exact: true }).click();
    await expect(estimate(page)).toContainText('£79');
    await expect(estimate(page)).not.toContainText('£478');
    expect(await forbiddenInputCount(page)).toBe(0);
    await next(page);

    // Step 4: done for you; the setup fee joins the estimate once this step is completed.
    await page.getByText('Done for you', { exact: true }).click();
    await next(page);
    await expect(estimate(page)).toContainText('First payment');
    await expect(estimate(page)).toContainText('£478');
    await expect(estimate(page)).toContainText('£399');
    expect(await forbiddenInputCount(page)).toBe(0);

    // Step 5: contact details.
    await next(page);
    await expect(page.getByRole('alert').filter({ hasText: 'Your name' })).toBeVisible();
    await page.getByLabel('Your name').fill('Test Person');
    await page.getByLabel('Email').fill('test.person@example.test');
    await page.getByLabel('Anything else we should know?').fill(`Intake test ${id}`);
    await next(page);

    // Step 6: consent is required before sending.
    expect(await forbiddenInputCount(page)).toBe(0);
    await page.getByRole('button', { name: 'Send my request' }).click();
    await expect(page.getByRole('alert').filter({ hasText: /consent/i })).toBeVisible();
    await page.getByLabel(/I agree that IK Cloud Solutions may use these details/).check();
    await page.getByRole('button', { name: 'Send my request' }).click();

    const success = page.getByRole('status').filter({ hasText: 'Thank you, we have your request' });
    await expect(success).toBeVisible();
    await expect(success).toContainText(/IK-[A-Z0-9]+/);
    const sent = await findInStub(request, id);
    expect(sent.raw).toContain('Meadowbank Test Dental');
    expect(errors).toEqual([]);
  });

  test('a pre-filled annual Starter with both channels matches the published vector', async ({
    page,
  }) => {
    await ready(page, '?plan=starter&channel=both&billing=annual');
    await completeBusinessStep(page);
    // The channel is already chosen from the link.
    await next(page);
    await expect(estimate(page)).toContainText('£892.20');
    await expect(estimate(page)).toContainText('£39');
    await expect(estimate(page)).toContainText('£853.20');
  });

  test('"not sure" hides every figure', async ({ page }) => {
    await ready(page);
    await completeBusinessStep(page);
    await page.getByText('Both voice and WhatsApp').click();
    await next(page);
    await page.getByText('Not sure yet', { exact: true }).click();
    await expect(estimate(page)).toContainText('no figures');
    await expect(estimate(page)).not.toContainText('£');
  });

  test('invalid pre-fill values are ignored', async ({ page }) => {
    await ready(page, '?plan=platinum&channel=carrier-pigeon&billing=weekly');
    await completeBusinessStep(page);
    // Nothing was pre-selected from the bad link, so the channel step still asks.
    for (const name of [
      /^Voice: an AI receptionist/,
      /^WhatsApp: an AI assistant/,
      /^Both voice/,
    ]) {
      await expect(page.getByRole('radio', { name })).not.toBeChecked();
    }
  });
});
