import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { ConsultationButton } from '@/components/forms/ConsultationButton';
import { ConsultationDialog } from '@/components/forms/ConsultationDialog';
import { ConsultationProvider, useConsultation } from '@/components/forms/ConsultationProvider';
import { londonDate } from '@/lib/dates';

// next/dynamic resolves asynchronously and only wraps this import; the provider logic under test
// is unchanged by loading the dialog synchronously here.
vi.mock('@/components/forms/ConsultationDialogLazy', async () => {
  const { ConsultationDialog: Dialog } = await import('@/components/forms/ConsultationDialog');
  return { ConsultationDialogLazy: Dialog };
});

const openButton = () => screen.getByRole('button', { name: 'Book a consultation' });
const dialog = () => screen.queryByRole('dialog', { name: 'Book a consultation' });

let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  errorSpy.mockRestore();
  warnSpy.mockRestore();
});

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Book a consultation
      </button>
      <ConsultationDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

describe('ConsultationDialog', () => {
  it('opens and closes ten times without a React error (hooks-order regression)', async () => {
    render(<DialogHarness />);
    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(openButton());
      expect(
        await screen.findByRole('dialog', { name: 'Book a consultation' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
      await waitFor(() => expect(dialog()).not.toBeInTheDocument());
    }
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('resets the form each time it opens because the form unmounts on close', async () => {
    render(<DialogHarness />);
    fireEvent.click(openButton());
    fireEvent.change(await screen.findByLabelText(/^Name/), { target: { value: 'Alex Murray' } });
    expect(screen.getByLabelText(/^Name/)).toHaveValue('Alex Murray');
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());

    fireEvent.click(openButton());
    expect(await screen.findByLabelText(/^Name/)).toHaveValue('');
  });

  it('computes the date window on the client with no hard-coded date', async () => {
    render(<DialogHarness />);
    fireEvent.click(openButton());
    const date = await screen.findByLabelText('Preferred date');
    const today = londonDate(new Date());
    await waitFor(() => expect(date).toHaveAttribute('min', today));
    expect(date).toHaveAttribute('max');
    expect(date).toHaveValue('');
  });

  it('includes the honeypot field', async () => {
    render(<DialogHarness />);
    fireEvent.click(openButton());
    await screen.findByRole('dialog');
    expect(document.querySelector('input[name="hp_confirm_ref"]')).not.toBeNull();
  });
});

describe('ConsultationProvider', () => {
  function Header() {
    return (
      <ConsultationProvider>
        <ConsultationButton>Book a consultation</ConsultationButton>
        <ConsultationButton preset={{ focus: 'FinOps review' }}>
          Request a cost review
        </ConsultationButton>
      </ConsultationProvider>
    );
  }

  it('opens from useConsultation() ten times without a React error', async () => {
    render(<Header />);
    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(openButton());
      expect(
        await screen.findByRole('dialog', { name: 'Book a consultation' }),
      ).toBeInTheDocument();
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      await waitFor(() => expect(dialog()).not.toBeInTheDocument());
    }
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('presets the "what do you need" choice', async () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Request a cost review' }));
    expect(await screen.findByLabelText(/What do you need help with/)).toHaveValue('FinOps review');
  });

  it('does not render the dialog until the first open', () => {
    render(<Header />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exposes close() so other code can dismiss the dialog', async () => {
    function Closer() {
      const { close } = useConsultation();
      return (
        <button type="button" onClick={close}>
          Dismiss
        </button>
      );
    }
    render(
      <ConsultationProvider>
        <ConsultationButton>Book a consultation</ConsultationButton>
        <Closer />
      </ConsultationProvider>,
    );
    fireEvent.click(openButton());
    await screen.findByRole('dialog');
    // The open dialog makes everything outside it aria-hidden, so query without the a11y filter.
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss', hidden: true }));
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it('throws a clear error outside a provider', () => {
    function Orphan() {
      useConsultation();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/ConsultationProvider/);
  });
});
