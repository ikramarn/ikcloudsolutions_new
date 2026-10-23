import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { CookieBanner } from '@/components/consent/CookieBanner';
import { PurgeLegacyStorage } from '@/components/consent/PurgeLegacyStorage';

function App() {
  return (
    <ConsentProvider>
      <CookieBanner />
      <PurgeLegacyStorage />
    </ConsentProvider>
  );
}

const banner = () => screen.queryByRole('region', { name: 'Cookie preferences' });

beforeEach(() => {
  const blocked = () => {
    throw new DOMException('Storage is blocked', 'SecurityError');
  };
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('blocked browser storage', () => {
  it('does not crash ConsentProvider, CookieBanner or PurgeLegacyStorage', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<App />)).not.toThrow();
    expect(banner()).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('honours Reject in memory for the session', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject non-essential' }));
    expect(banner()).not.toBeInTheDocument();
  });

  it('honours Accept in memory for the session', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept analytics' }));
    expect(banner()).not.toBeInTheDocument();
  });

  it('shows the banner again on the next page load, because nothing was saved', () => {
    const first = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject non-essential' }));
    first.unmount();
    render(<App />);
    expect(banner()).toBeInTheDocument();
  });
});
