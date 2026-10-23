import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bannerCopy } from '@/components/consent/copy';
import { AnalyticsGate } from '@/components/consent/AnalyticsGate';
import { CookieBanner } from '@/components/consent/CookieBanner';
import { CookieSettings } from '@/components/consent/CookieSettings';
import { CONSENT_STORAGE_KEY, ConsentProvider } from '@/components/consent/ConsentProvider';

const analyticsConfigMock = vi.hoisted(() => ({ enabled: false }));
vi.mock('@/config/analytics', () => ({ analyticsConfig: analyticsConfigMock }));

function App() {
  return (
    <ConsentProvider>
      <CookieBanner />
      <CookieSettings />
      <AnalyticsGate>
        <p>analytics-on</p>
      </AnalyticsGate>
    </ConsentProvider>
  );
}

const banner = () => screen.queryByRole('region', { name: 'Cookie preferences' });

beforeEach(() => {
  window.localStorage.clear();
  analyticsConfigMock.enabled = false;
});

afterEach(() => {
  window.localStorage.clear();
});

describe('bannerCopy', () => {
  it('says analytics does not currently run while it is disabled', () => {
    expect(bannerCopy(false)).toContain('do not currently run');
  });

  it('does not make that statement when analytics is enabled', () => {
    expect(bannerCopy(true)).not.toContain('do not currently run');
  });
});

describe('CookieBanner', () => {
  it('is not in the server HTML (it appears after hydration only)', () => {
    expect(renderToString(<App />)).not.toContain('Cookie preferences');
  });

  it('shows with no stored choice, as a non-modal region that does not take focus', () => {
    render(<App />);
    const region = banner();
    expect(region).toBeInTheDocument();
    expect(region).not.toHaveAttribute('aria-modal');
    expect(region?.closest('[role="dialog"]')).toBeNull();
    expect(document.body).toHaveFocus();
    expect(screen.getByText(bannerCopy(false))).toBeInTheDocument();
  });

  it('offers equal-weight Reject and Accept buttons plus a preferences link', () => {
    render(<App />);
    const reject = screen.getByRole('button', { name: 'Reject non-essential' });
    const accept = screen.getByRole('button', { name: 'Accept analytics' });
    expect(reject.className).toBe(accept.className);
    expect(screen.getByRole('link', { name: 'Preferences' })).toHaveAttribute('href', '/cookies');
  });

  it('persists Reject and stays hidden after a reload', () => {
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject non-essential' }));
    expect(banner()).not.toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? 'null');
    expect(stored).toMatchObject({ version: 1, analytics: false });
    expect(typeof stored.decidedAt).toBe('string');

    unmount();
    render(<App />);
    expect(banner()).not.toBeInTheDocument();
  });

  it('persists Accept', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept analytics' }));
    expect(JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? 'null')).toMatchObject({
      analytics: true,
    });
  });

  it('reopens from the footer-style Cookie settings button', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject non-essential' }));
    expect(banner()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cookie settings' }));
    expect(banner()).toBeInTheDocument();
  });

  it('treats a corrupt stored record as no decision', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '{not json');
    render(<App />);
    expect(banner()).toBeInTheDocument();
  });
});

describe('AnalyticsGate', () => {
  it('renders nothing while analytics is disabled, even after Accept', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept analytics' }));
    expect(screen.queryByText('analytics-on')).not.toBeInTheDocument();
  });

  it('renders children only when enabled AND accepted', () => {
    analyticsConfigMock.enabled = true;
    render(<App />);
    expect(screen.queryByText('analytics-on')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Accept analytics' }));
    expect(screen.getByText('analytics-on')).toBeInTheDocument();
  });

  it('stays closed after Reject even when enabled', () => {
    analyticsConfigMock.enabled = true;
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject non-essential' }));
    expect(screen.queryByText('analytics-on')).not.toBeInTheDocument();
  });
});
