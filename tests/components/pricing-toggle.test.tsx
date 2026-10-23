import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { PricingToggle } from '@/components/ui/PricingToggle';

function Harness({ annualLabel }: { annualLabel: string }) {
  const [value, setValue] = useState<'monthly' | 'annual'>('monthly');
  return <PricingToggle value={value} onChange={setValue} annualLabel={annualLabel} />;
}

describe('PricingToggle', () => {
  it('renders two native radios in a fieldset with a hidden legend', () => {
    render(<Harness annualLabel="Annual, example label" />);
    const group = screen.getByRole('group', { name: 'Billing period' });
    expect(group.tagName).toBe('FIELDSET');
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios.every((radio) => radio.getAttribute('type') === 'radio')).toBe(true);
  });

  it('uses the label it is given for the annual option', () => {
    render(<Harness annualLabel="Annual, example label" />);
    expect(screen.getByRole('radio', { name: 'Annual, example label' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  });

  it('switches period when an option is chosen', () => {
    render(<Harness annualLabel="Annual, example label" />);
    fireEvent.click(screen.getByRole('radio', { name: 'Annual, example label' }));
    expect(screen.getByRole('radio', { name: 'Annual, example label' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Monthly' })).not.toBeChecked();
  });
});
