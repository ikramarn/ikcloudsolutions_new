import { render } from '@testing-library/react';
import { ContactForm } from '@/components/forms/ContactForm';
import { ConsultationForm } from '@/components/forms/ConsultationForm';
import { Honeypot } from '@/components/forms/Honeypot';

describe('Honeypot', () => {
  it('renders the non-semantic field that bots fill and people never see', () => {
    const { container } = render(<Honeypot />);
    const input = container.querySelector<HTMLInputElement>('input[name="hp_confirm_ref"]');
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input!.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('moves the wrapper off-screen instead of using display:none', () => {
    const { container } = render(<Honeypot />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper?.className).toContain('-left-[9999px]');
    expect(wrapper?.className).not.toMatch(/(^|\s)(hidden|invisible)(\s|$)/);
  });

  it('has a hidden label that tells a person to leave it empty', () => {
    const { container } = render(<Honeypot />);
    const input = container.querySelector('input')!;
    const label = container.querySelector(`label[for="${input.id}"]`);
    expect(label).toHaveTextContent('Leave this field empty');
  });

  it.each([
    ['ContactForm', <ContactForm key="c" />],
    ['ConsultationForm', <ConsultationForm key="d" />],
  ])('is present in %s', (_name, form) => {
    const { container } = render(form);
    expect(container.querySelectorAll('input[name="hp_confirm_ref"]')).toHaveLength(1);
  });
});
