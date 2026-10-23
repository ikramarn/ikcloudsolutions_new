import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';

const items: readonly AccordionItem[] = [
  { id: 'one', question: 'First question?', answer: 'Closed answer number one.' },
  { id: 'two', question: 'Second question?', answer: 'Closed answer number two.' },
];

describe('Accordion server HTML', () => {
  it('contains every answer while all panels are closed (Radix Presence regression)', () => {
    const html = renderToString(<Accordion items={items} />);
    for (const item of items) {
      expect(html).toContain(item.answer as string);
      expect(html).toContain(item.question);
    }
  });

  it('marks closed panels as closed and hides them by class', () => {
    const html = renderToString(<Accordion items={items} />);
    expect(html).toContain('data-state="closed"');
    expect(html).not.toContain('data-state="open"');
    expect(html).toContain('data-[state=closed]:hidden');
    expect(html).toContain('aria-expanded="false"');
  });
});

describe('Accordion behaviour', () => {
  it('opens a panel from its trigger and closes it again', () => {
    render(<Accordion items={items} />);
    const trigger = screen.getByRole('button', { name: 'First question?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Closed answer number one.')).toHaveAttribute('data-state', 'open');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
