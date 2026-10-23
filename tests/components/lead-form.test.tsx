import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LeadForm } from '@/components/forms/LeadForm';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { FormField } from '@/components/ui/FormField';
import { siteConfig } from '@/config/site';

interface MockProps {
  siteKey: string;
  onSuccess?: (token: string) => void;
  ref?: React.Ref<{ reset: () => void }>;
}

const widget = vi.hoisted(() => ({ props: null as unknown as MockProps, reset: vi.fn() }));

vi.mock('@marsidev/react-turnstile', async () => {
  const { useEffect, useImperativeHandle } = await import('react');
  function Turnstile(props: MockProps) {
    const { ref } = props;
    useImperativeHandle(ref, () => ({ reset: widget.reset }));
    useEffect(() => {
      widget.props = props;
    });
    return <div data-testid="turnstile-widget" />;
  }
  return { Turnstile };
});

const FIELDS = ['firstName', 'lastName', 'email', 'subject', 'interest', 'message'] as const;
const LABELS = { email: 'Email', message: 'Message' };

function Form({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  return (
    <LeadForm
      type="contact"
      fieldNames={FIELDS}
      labels={LABELS}
      submitLabel="Send message"
      successTitle="Thanks"
      successMessage="We have it."
      turnstileSiteKey={turnstileSiteKey}
    >
      {({ errors }) => (
        <>
          <FormField label="First name" error={errors.firstName}>
            {(c) => <Input name="firstName" {...c} />}
          </FormField>
          <FormField label="Last name" error={errors.lastName}>
            {(c) => <Input name="lastName" {...c} />}
          </FormField>
          <FormField label="Email" error={errors.email}>
            {(c) => <Input name="email" {...c} />}
          </FormField>
          <FormField label="Subject" error={errors.subject}>
            {(c) => <Input name="subject" {...c} />}
          </FormField>
          <FormField label="Interest" error={errors.interest}>
            {(c) => (
              <Select name="interest" defaultValue="" {...c}>
                <option value="">Choose</option>
                <option value="FinOps review">FinOps review</option>
              </Select>
            )}
          </FormField>
          <FormField label="Message" error={errors.message}>
            {(c) => <Textarea name="message" {...c} />}
          </FormField>
        </>
      )}
    </LeadForm>
  );
}

function fill(overrides: Partial<Record<(typeof FIELDS)[number], string>> = {}) {
  const values = {
    'First name': overrides.firstName ?? 'Alex',
    'Last name': overrides.lastName ?? 'Murray',
    Email: overrides.email ?? 'alex@example.com',
    Subject: overrides.subject ?? 'Cloud costs',
    Interest: overrides.interest ?? 'FinOps review',
    Message: overrides.message ?? 'We would like help reviewing our cloud bill.',
  };
  for (const [label, value] of Object.entries(values)) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}

const submitButton = () => screen.getByRole('button', { name: /send message|checking|sending/i });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const failureBody = (code: string, extra: Record<string, unknown> = {}) => ({
  ok: false,
  error: { code, message: 'The server said no.', ...extra },
});

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  widget.reset.mockClear();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const sentPayload = (call = 0) =>
  JSON.parse((fetchMock.mock.calls[call]![1] as RequestInit).body as string) as Record<
    string,
    unknown
  >;

describe('LeadForm success', () => {
  it('shows success only when res.ok and body.ok === true, with the server reference', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, reference: 'IK-7F3K9QX2' }));
    render(<Form />);
    fill();
    submit();
    expect(await screen.findByRole('status')).toHaveTextContent('Thanks');
    expect(screen.getByText('IK-7F3K9QX2')).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/lead');
    expect(init.method).toBe('POST');
    expect(sentPayload()).toMatchObject({
      type: 'contact',
      firstName: 'Alex',
      email: 'alex@example.com',
      hp_confirm_ref: '',
    });
  });

  it('sends the honeypot field and a Content-Type of application/json', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, reference: 'IK-7F3K9QX2' }));
    const { container } = render(<Form />);
    expect(container.querySelector('input[name="hp_confirm_ref"]')).toHaveAttribute(
      'tabindex',
      '-1',
    );
    fill();
    submit();
    await screen.findByRole('status');
    expect((fetchMock.mock.calls[0]![1] as RequestInit).headers).toEqual({
      'Content-Type': 'application/json',
    });
  });
});

describe('LeadForm delivery failures never look like success', () => {
  it('shows the error and the mailto fallback for a 502, keeping the values', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(failureBody('delivery_failed', { reference: 'IK-7F3K9QX2' }), 502),
    );
    render(<Form />);
    fill();
    submit();
    expect(await screen.findByText('The server said no.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: siteConfig.email })).toHaveAttribute(
      'href',
      `mailto:${siteConfig.email}`,
    );
    expect(screen.getByLabelText('First name')).toHaveValue('Alex');
    expect(screen.getByLabelText('Message')).toHaveValue(
      'We would like help reviewing our cloud bill.',
    );
    expect(screen.getByLabelText('Interest')).toHaveValue('FinOps review');
  });

  it('moves focus to the error summary', async () => {
    fetchMock.mockResolvedValue(jsonResponse(failureBody('delivery_failed'), 502));
    render(<Form />);
    fill();
    submit();
    const summary = (await screen.findByText('The server said no.')).closest('[role="alert"]');
    await waitFor(() => expect(document.activeElement).toBe(summary));
  });

  it('treats a network failure as a delivery failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<Form />);
    fill();
    submit();
    expect(await screen.findByText(/We could not send your message/)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: siteConfig.email })).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toHaveValue('Alex');
  });

  it('treats an unparseable body as a delivery failure even on HTTP 200', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Gateway</html>', { status: 200 }));
    render(<Form />);
    fill();
    submit();
    expect(await screen.findByText(/We could not send your message/)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('treats a body without ok:true as a failure even on HTTP 200', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reference: 'IK-7F3K9QX2' }));
    render(<Form />);
    fill();
    submit();
    expect(await screen.findByText(/We could not send your message/)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('treats ok:true on a non-2xx status as a failure', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, reference: 'IK-7F3K9QX2' }, 502));
    render(<Form />);
    fill();
    submit();
    expect(await screen.findByText(/We could not send your message/)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('resends the server reference as clientReference on the retry', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(failureBody('delivery_failed', { reference: 'IK-7F3K9QX2' }), 502),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true, reference: 'IK-7F3K9QX2' }));
    render(<Form />);
    fill();
    submit();
    await screen.findByText('The server said no.');
    expect(sentPayload(0)).not.toHaveProperty('clientReference');

    submit();
    await screen.findByRole('status');
    expect(sentPayload(1)).toMatchObject({ clientReference: 'IK-7F3K9QX2' });
  });
});

describe('LeadForm validation', () => {
  it('validates on the client with the shared schema and does not call the API', () => {
    render(<Form />);
    submit();
    const summary = screen.getByRole('alert');
    expect(summary).toHaveTextContent('Please check the following:');
    expect(summary).toHaveTextContent('Email:');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(document.activeElement).toBe(summary);
  });

  it('shows per-field server errors inline for a validation_error', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        failureBody('validation_error', { fields: { email: 'Enter a valid email address' } }),
        400,
      ),
    );
    render(<Form />);
    fill();
    submit();
    const message = await screen.findAllByText('Enter a valid email address');
    expect(message.length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: siteConfig.email })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('LeadForm with Turnstile', () => {
  it('keeps submit aria-disabled and refuses to run until a token arrives', async () => {
    render(<Form turnstileSiteKey="site-key" />);
    expect(submitButton()).toHaveTextContent('Checking you are human...');
    expect(submitButton()).toHaveAttribute('aria-disabled', 'true');

    fill();
    fireEvent.focus(screen.getByLabelText('First name'));
    fireEvent.submit(screen.getByRole('button', { name: /checking/i }).closest('form')!);
    expect(fetchMock).not.toHaveBeenCalled();

    // The widget mounts once the visitor starts the form.
    expect(await screen.findByTestId('turnstile-widget')).toBeInTheDocument();
    act(() => widget.props.onSuccess?.('token-1'));
    expect(submitButton()).toHaveTextContent('Send message');
    expect(submitButton()).not.toHaveAttribute('aria-disabled');

    fetchMock.mockResolvedValue(jsonResponse({ ok: true, reference: 'IK-7F3K9QX2' }));
    submit();
    await screen.findByRole('status');
    expect(sentPayload()).toMatchObject({ turnstileToken: 'token-1' });
  });

  it('resets the widget and waits for a fresh token after a 502', async () => {
    render(<Form turnstileSiteKey="site-key" />);
    fill();
    fireEvent.focus(screen.getByLabelText('First name'));
    await screen.findByTestId('turnstile-widget');
    act(() => widget.props.onSuccess?.('token-1'));

    fetchMock.mockResolvedValue(jsonResponse(failureBody('delivery_failed'), 502));
    submit();
    await screen.findByText('The server said no.');
    expect(widget.reset).toHaveBeenCalledTimes(1);
    expect(submitButton()).toHaveTextContent('Checking you are human...');
    expect(submitButton()).toHaveAttribute('aria-disabled', 'true');

    // The spent token is never re-sent.
    fireEvent.submit(submitButton().closest('form')!);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => widget.props.onSuccess?.('token-2'));
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, reference: 'IK-7F3K9QX2' }));
    submit();
    await screen.findByRole('status');
    expect(sentPayload(1)).toMatchObject({ turnstileToken: 'token-2' });
  });

  it('does not gate submit when there is no site key', () => {
    render(<Form />);
    expect(submitButton()).toHaveTextContent('Send message');
    expect(screen.queryByTestId('turnstile-widget')).not.toBeInTheDocument();
  });
});
