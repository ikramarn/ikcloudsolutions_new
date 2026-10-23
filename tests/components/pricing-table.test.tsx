import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AddonsTable } from '@/components/agents/AddonsTable';
import { OverageTable } from '@/components/agents/OverageTable';
import { PricingTable } from '@/components/agents/PricingTable';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import type { VatMode } from '@/lib/money';

function withMode(mode: VatMode): PricingConfig {
  return { ...pricingConfig, vat: { mode, ratePercent: 20 } };
}

function card(name: string): HTMLElement {
  const heading = screen.getByRole('heading', { name, level: 3 });
  const element = heading.closest('li');
  if (!element) throw new Error(`No card for ${name}`);
  return element;
}

describe('PricingTable (exclusive VAT)', () => {
  it.each([
    ['Starter', '£79'],
    ['Pro', '£249'],
    ['Premium', '£649'],
  ])('shows the monthly %s price with + VAT', (name, price) => {
    render(<PricingTable />);
    const text = card(name).textContent ?? '';
    expect(text).toContain(price);
    expect(text).toContain('a month + VAT');
  });

  it.each([
    ['Starter', '£71.10', '£853.20', '£94.80'],
    ['Pro', '£224.10', '£2,689.20', '£298.80'],
    ['Premium', '£584.10', '£7,009.20', '£778.80'],
  ])('shows annual %s per-month, billed and saving figures', (name, perMonth, billed, saving) => {
    render(<PricingTable />);
    fireEvent.click(screen.getByRole('radio', { name: /^Annual/ }));
    const text = card(name).textContent ?? '';
    expect(text).toContain(perMonth);
    expect(text).toContain(`billed ${billed} a year`);
    expect(text).toContain(`save ${saving} a year`);
  });

  it('builds the annual label from config', () => {
    render(<PricingTable />);
    expect(
      screen.getByRole('radio', {
        name: `Annual, save ${pricingConfig.annualDiscountPercent}%`,
      }),
    ).toBeInTheDocument();
  });

  it('shows voice minutes and AI WhatsApp replies on separate lines, never combined', () => {
    render(<PricingTable />);
    const pro = within(card('Pro')).getByRole('list', { name: 'Pro allowances' });
    const lines = within(pro)
      .getAllByRole('listitem')
      .map((item) => item.textContent);
    expect(lines).toEqual(['Voice minutes: 500 a month', 'AI WhatsApp replies: 5,000 a month']);
  });

  it('makes the Starter allowance lines conditional on the channel', () => {
    render(<PricingTable />);
    const text = card('Starter').textContent ?? '';
    expect(text).toContain('Voice minutes: 200 a month if you choose voice');
    expect(text).toContain('AI WhatsApp replies: 1,000 a month if you choose WhatsApp');
    expect(text).toContain('The other channel is the second-channel add-on.');
  });

  it('links each plan to the intake with its plan and billing period', () => {
    render(<PricingTable />);
    fireEvent.click(screen.getByRole('radio', { name: /^Annual/ }));
    const link = within(card('Pro')).getByRole('link', { name: 'Choose Pro' });
    expect(link).toHaveAttribute('href', '/ai-agents/get-started?plan=pro&billing=annual');
  });
});

describe('PricingTable (inclusive VAT)', () => {
  it('shows VAT-inclusive prices and notes', () => {
    render(<PricingTable config={withMode('inclusive')} />);
    const text = card('Starter').textContent ?? '';
    expect(text).toContain('£94.80');
    expect(text).toContain('inc. VAT');
    expect(text).not.toContain('+ VAT');
  });
});

describe('OverageTable', () => {
  it('shows net rates in exclusive mode', () => {
    render(<OverageTable />);
    const cells = screen.getAllByText(/^£0\.\d+$/).map((cell) => cell.textContent);
    expect(cells).toContain('£0.20');
    expect(cells).toContain('£0.02');
  });

  it('shows £0.24 and £0.024 in inclusive mode', () => {
    render(<OverageTable config={withMode('inclusive')} />);
    const cells = screen.getAllByText(/^£0\.\d+$/).map((cell) => cell.textContent);
    expect(cells).toContain('£0.24');
    expect(cells).toContain('£0.024');
  });
});

describe('AddonsTable', () => {
  it('labels each price one-time, per month or per year and marks coming soon', () => {
    render(<AddonsTable />);
    const text = document.body.textContent ?? '';
    expect(text).toContain('one-time + VAT');
    expect(text).toContain('per month + VAT');
    expect(text).toContain('per year + VAT');
    expect(text).toContain('Coming soon');
    expect(text).toContain('Starter only');
  });

  it('can show a subset of add-ons', () => {
    render(<AddonsTable only={['website-express', 'domain']} />);
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});
