import { expect, test } from './helpers';
import { preDecideConsent } from './support';

// Amendment A7. This spec runs only in the "turnstile" project, against a second build of the
// site (port 3101) made with NEXT_PUBLIC_TURNSTILE_SITE_KEY set to Cloudflare's published
// always-pass test key. The challenge script is blocked, as an ad blocker or a corporate proxy
// would do, and the form must fail closed with a way for the visitor to carry on.
const SITE_EMAIL = 'admin@ikcloudsolutions.com';
const LOAD_TIMEOUT_MS = 10_000;

test.describe('Turnstile blocked (A7)', () => {
  test('after ten seconds the form explains and offers an email route, and stays disabled', async ({
    page,
  }) => {
    const blocked: string[] = [];
    const posts: string[] = [];
    await page.route('**://challenges.cloudflare.com/**', (route) => {
      blocked.push(route.request().url());
      return route.abort('blockedbyclient');
    });
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/lead')) {
        posts.push(request.url());
      }
    });
    await preDecideConsent(page);
    await page.clock.install();
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // The widget mounts only once the visitor starts the form.
    await page.getByLabel('First name').focus();
    await expect
      .poll(() => blocked.length, { message: 'the challenge script was requested' })
      .toBeGreaterThan(0);

    const submit = page.getByRole('button', { name: /Checking you are human|Send message/ });
    await expect(submit).toHaveAttribute('aria-disabled', 'true');
    const alert = page.getByRole('alert').filter({ hasText: 'We could not load the spam check' });
    await expect(alert).toHaveCount(0);

    await page.clock.fastForward(LOAD_TIMEOUT_MS + 1000);
    await expect(alert).toBeVisible();
    await expect(alert.getByRole('link', { name: SITE_EMAIL })).toHaveAttribute(
      'href',
      `mailto:${SITE_EMAIL}`,
    );
    await expect(alert.getByRole('button', { name: 'Try again' })).toBeVisible();

    // Fail closed: even a fully valid form cannot be sent without a token.
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('Person');
    await page.getByLabel('Email').fill('test.person@example.test');
    await page.getByLabel('Subject').fill('Blocked spam check');
    await page.getByLabel('What is this about?').selectOption('AI Front Desk');
    await page.getByLabel('Message').fill('This message must not be sent without a token.');
    await expect(submit).toHaveAttribute('aria-disabled', 'true');
    // force: Playwright treats aria-disabled as "not enabled" and would otherwise wait forever.
    await submit.click({ force: true });
    await page.clock.fastForward(1000);
    expect(posts).toEqual([]);
    await expect(page.getByText('Thank you, we have your message')).toHaveCount(0);
  });

  test('"Try again" remounts the widget and the notice returns if it is still blocked', async ({
    page,
  }) => {
    let requests = 0;
    await page.route('**://challenges.cloudflare.com/**', (route) => {
      requests += 1;
      return route.abort('blockedbyclient');
    });
    await preDecideConsent(page);
    await page.clock.install();
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('First name').focus();

    const alert = page.getByRole('alert').filter({ hasText: 'We could not load the spam check' });
    await page.clock.fastForward(LOAD_TIMEOUT_MS + 1000);
    await expect(alert).toBeVisible();

    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(alert).toHaveCount(0);
    await page.clock.fastForward(LOAD_TIMEOUT_MS + 1000);
    await expect(alert).toBeVisible();
    expect(requests).toBeGreaterThan(0);
  });
});
