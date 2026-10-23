import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadLinks() {
  vi.resetModules();
  return import('@/config/links');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('getStartedHref without NEXT_PUBLIC_APP_URL', () => {
  it('points at the on-site intake', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
    const { getStartedHref, isExternalCta } = await loadLinks();
    expect(getStartedHref()).toBe('/ai-agents/get-started');
    expect(isExternalCta(getStartedHref())).toBe(false);
  });

  it('adds only the options that are given', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
    const { getStartedHref } = await loadLinks();
    expect(getStartedHref({ plan: 'pro', channel: 'voice', billing: 'annual' })).toBe(
      '/ai-agents/get-started?plan=pro&channel=voice&billing=annual',
    );
    expect(getStartedHref({ plan: 'starter' })).toBe('/ai-agents/get-started?plan=starter');
  });
});

describe('getStartedHref with NEXT_PUBLIC_APP_URL', () => {
  it('points at the app signup and is external', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.test/');
    const { getStartedHref, isExternalCta } = await loadLinks();
    const href = getStartedHref({ plan: 'pro', billing: 'monthly' });
    expect(href).toBe('https://app.example.test/signup?plan=pro&billing=monthly');
    expect(isExternalCta(href)).toBe(true);
  });

  it('ignores an invalid app URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'javascript:alert(1)');
    const { getStartedHref } = await loadLinks();
    expect(getStartedHref()).toBe('/ai-agents/get-started');
  });

  it('keeps done-for-you on the on-site intake', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.test');
    const { doneForYouHref } = await loadLinks();
    expect(doneForYouHref).toBe('/ai-agents/get-started');
  });
});
