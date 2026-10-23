import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IntakeForm } from '@/components/forms/IntakeForm';
import { EstimatePanel } from '@/components/forms/intake/EstimatePanel';
import type { EstimateSelection } from '@/lib/pricing';
import { parseIntakePrefill } from '@/lib/validation/intake';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const next = () => fireEvent.click(screen.getByRole('button', { name: 'Next' }));
const heading = () => screen.getByRole('heading', { level: 2 });

function fillBusiness(name = 'Pennant Heating and Plumbing') {
  fireEvent.change(screen.getByLabelText(/Business name/), { target: { value: name } });
  fireEvent.click(screen.getByRole('radio', { name: /Home services/ }));
}

function fillContact() {
  fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'Alex Murray' } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'alex@example.com' } });
}

/** Walks a pre-filled wizard (channel and plan given) to the contact step. */
function walkToContact() {
  fillBusiness();
  next(); // business -> channels
  next(); // channels -> plan
  next(); // plan -> setup
  next(); // setup -> contact
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('IntakeForm steps', () => {
  it('starts at step 1 of 6 and describes the six steps', () => {
    render(<IntakeForm />);
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
    expect(heading()).toHaveTextContent('Your business');
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(6);
  });

  it('validates each step, shows an error summary and stays on the step', () => {
    render(<IntakeForm />);
    next();
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
    const summary = screen.getByRole('alert');
    expect(summary).toHaveTextContent('Please check the following');
    expect(summary).toHaveTextContent('Business name');
    expect(summary).toHaveTextContent('Industry');
    expect(document.activeElement).toBe(summary);
  });

  it('moves the focus to the step heading when the step changes', () => {
    render(<IntakeForm />);
    fillBusiness();
    next();
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
    expect(heading()).toHaveTextContent('Channels');
    expect(document.activeElement).toBe(heading());
  });

  it('requires a channel before moving on', () => {
    render(<IntakeForm />);
    fillBusiness();
    next();
    next();
    expect(screen.getByRole('alert')).toHaveTextContent('Channels');
    fireEvent.click(screen.getByRole('radio', { name: /^Both voice and WhatsApp/ }));
    next();
    expect(heading()).toHaveTextContent('Plan and add-ons');
  });

  it('goes back without losing what was typed', () => {
    render(<IntakeForm />);
    fillBusiness('Harbour Lane Lettings and Sales');
    next();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText(/Business name/)).toHaveValue('Harbour Lane Lettings and Sales');
  });

  it('never submits on Enter before the last step', () => {
    const { container } = render(<IntakeForm />);
    fillBusiness();
    const form = container.querySelector('form');
    if (!form) throw new Error('No form');
    fireEvent.submit(form);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(heading()).toHaveTextContent('Channels');
  });

  it('asks for the industry in words when "something else" is chosen', () => {
    render(<IntakeForm />);
    fillBusiness();
    fireEvent.click(screen.getByRole('radio', { name: /Something else/ }));
    next();
    expect(screen.getByRole('alert')).toHaveTextContent('Tell us your industry');
    fireEvent.change(screen.getByLabelText(/Tell us your industry/), {
      target: { value: 'Funeral directors' },
    });
    next();
    expect(heading()).toHaveTextContent('Channels');
  });

  it('suggests the website add-on when "no website yet" is ticked', () => {
    render(<IntakeForm prefill={{ channel: 'voice', plan: 'pro' }} />);
    fillBusiness();
    fireEvent.click(screen.getByRole('checkbox', { name: /do not have a website yet/ }));
    next();
    next();
    expect(screen.getByRole('checkbox', { name: /AI website generator/ })).toBeChecked();
  });
});

describe('IntakeForm pre-fill', () => {
  it('pre-fills valid values and ignores invalid enums', () => {
    const prefill = parseIntakePrefill({
      plan: 'gold',
      channel: 'both',
      billing: 'weekly',
      industry: 'bakery',
    });
    render(<IntakeForm prefill={prefill} />);
    // The invalid industry is ignored, so nothing is selected yet.
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
    fillBusiness();
    next();
    expect(screen.getByRole('radio', { name: /^Both voice and WhatsApp/ })).toBeChecked();
    next();
    // The invalid plan was ignored, so the plan step still needs an answer.
    next();
    expect(screen.getByRole('alert')).toHaveTextContent('Plan');
    expect(screen.getByRole('radio', { name: /^Monthly/ })).toBeChecked();
  });

  it('pre-fills a valid industry', () => {
    render(<IntakeForm prefill={parseIntakePrefill({ industry: 'clinics' })} />);
    expect(screen.getByRole('radio', { name: /Private or dental clinic/ })).toBeChecked();
  });

  it('drops unknown add-on ids and keeps known ones', () => {
    render(
      <IntakeForm
        prefill={parseIntakePrefill({
          plan: 'pro',
          channel: 'voice',
          addons: 'not-a-real-addon,extra-number',
        })}
      />,
    );
    fillBusiness();
    next();
    next();
    expect(screen.getByRole('checkbox', { name: /Extra UK phone number/ })).toBeChecked();
    expect(
      screen.getAllByRole('checkbox').filter((box) => (box as HTMLInputElement).checked),
    ).toHaveLength(1);
  });
});

describe('IntakeForm plan step and estimate', () => {
  const starterBoth = { plan: 'starter', channel: 'both' } as const;

  it('pre-ticks and locks the second channel for Starter with both channels (£118 a month)', () => {
    render(<IntakeForm prefill={starterBoth} />);
    fillBusiness();
    next();
    next();
    const second = screen.getByRole('checkbox', { name: /Second channel for Starter/ });
    expect(second).toBeChecked();
    expect(second).toBeDisabled();
    expect(
      screen.getByText('Added because Starter with both channels needs it.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Your estimate' })).toHaveTextContent('£118 + VAT');
  });

  it('disables restricted add-ons with the reason', () => {
    render(<IntakeForm prefill={{ plan: 'pro', channel: 'both' }} />);
    fillBusiness();
    next();
    next();
    const restricted = screen.getByRole('checkbox', { name: /Second channel for Starter/ });
    expect(restricted).toBeDisabled();
    expect(screen.getByText('Only available with Starter.')).toBeInTheDocument();
  });

  it('disables coming-soon add-ons and offers to register interest', () => {
    render(<IntakeForm prefill={{ plan: 'pro', channel: 'both' }} />);
    fillBusiness();
    next();
    next();
    const comingSoon = screen.getByRole('checkbox', { name: /Additional language or voice/ });
    expect(comingSoon).toBeDisabled();
    expect(screen.getByText(/Coming soon\. Mention it in your notes/)).toBeInTheDocument();
  });

  it('hides every figure when the plan is "not sure"', () => {
    render(<IntakeForm prefill={{ channel: 'voice' }} />);
    fillBusiness();
    next();
    next();
    fireEvent.click(screen.getByRole('radio', { name: /Not sure yet/ }));
    const panel = screen.getByRole('region', { name: 'Your estimate' });
    expect(panel).toHaveTextContent('show no figures');
    expect(panel.textContent).not.toMatch(/£/);
  });

  it('adds the setup fee only after the set-up step is done', () => {
    render(<IntakeForm prefill={{ plan: 'starter', channel: 'voice' }} />);
    fillBusiness();
    next();
    next();
    // Plan step: no setup fee yet, just the first month.
    expect(screen.getByRole('region', { name: 'Your estimate' })).toHaveTextContent('£79 + VAT');
    expect(screen.getByText(/setup fee is added once you have chosen/)).toBeInTheDocument();
    next();
    expect(heading()).toHaveTextContent('Set-up');
    next();
    // Contact step: Starter, monthly, voice, done-for-you is £79 + £399 setup.
    expect(heading()).toHaveTextContent('Your details');
    expect(screen.getByRole('region', { name: 'Your estimate' })).toHaveTextContent('£478 + VAT');
  });

  it('keeps the setup fee out when self-serve is chosen', () => {
    render(<IntakeForm prefill={{ plan: 'starter', channel: 'voice' }} />);
    fillBusiness();
    next();
    next();
    next();
    fireEvent.click(screen.getByRole('radio', { name: /I will set it up myself later/ }));
    next();
    expect(screen.getByRole('region', { name: 'Your estimate' })).toHaveTextContent('£79 + VAT');
  });
});

describe('EstimatePanel vectors', () => {
  const base: EstimateSelection = {
    planId: 'starter',
    billing: 'monthly',
    channel: 'voice',
    setupPreference: 'self-serve-later',
    addonIds: [],
  };

  it('Starter, annual, voice, second channel: first payment £892.20', () => {
    render(
      <EstimatePanel selection={{ ...base, billing: 'annual', addonIds: ['second-channel'] }} />,
    );
    expect(screen.getByRole('region')).toHaveTextContent('£892.20 + VAT');
    expect(screen.getByRole('region')).toHaveTextContent('Every month£39 + VAT');
  });

  it('Pro, monthly, both, knowledge base and a coming-soon add-on: first payment £398', () => {
    render(
      <EstimatePanel
        selection={{
          ...base,
          planId: 'pro',
          channel: 'both',
          addonIds: ['kb-essentials', 'extra-language'],
        }}
      />,
    );
    const panel = screen.getByRole('region');
    expect(panel).toHaveTextContent('£398 + VAT');
    expect(panel).toHaveTextContent('Left out of the estimate: extra-language');
  });

  it('Starter, monthly, voice, done-for-you: first payment £478', () => {
    render(<EstimatePanel selection={{ ...base, setupPreference: 'done-for-you' }} />);
    expect(screen.getByRole('region')).toHaveTextContent('£478 + VAT');
  });

  it('Pro, annual, both, done-for-you, extra number: first payment £3,643.20', () => {
    render(
      <EstimatePanel
        selection={{
          ...base,
          planId: 'pro',
          billing: 'annual',
          channel: 'both',
          setupPreference: 'done-for-you',
          addonIds: ['extra-number'],
        }}
      />,
    );
    expect(screen.getByRole('region')).toHaveTextContent('£3,643.20 + VAT');
  });

  it('Starter, monthly, both channels: £118 a month with the second channel added', () => {
    render(<EstimatePanel selection={{ ...base, channel: 'both' }} />);
    const panel = screen.getByRole('region');
    expect(panel).toHaveTextContent('Every month£118 + VAT');
    expect(panel).toHaveTextContent('Included because your plan needs it: second-channel');
  });

  it('shows no figures when the plan is not sure, and a prompt when nothing is chosen', () => {
    const { rerender } = render(<EstimatePanel selection={{ ...base, planId: 'not-sure' }} />);
    expect(screen.getByRole('region').textContent).not.toMatch(/£/);
    rerender(<EstimatePanel selection={null} />);
    expect(screen.getByRole('region')).toHaveTextContent('Choose a channel and a plan');
  });

  it('labels the estimate indicative', () => {
    render(<EstimatePanel selection={base} />);
    expect(screen.getByRole('region')).toHaveTextContent(
      'We confirm a quote before you pay anything',
    );
  });
});

describe('IntakeForm submission', () => {
  const prefill = { plan: 'pro', channel: 'both' } as const;

  function reachReview() {
    render(<IntakeForm prefill={prefill} />);
    walkToContact();
    fillContact();
    next();
    expect(heading()).toHaveTextContent('Review and send');
  }

  it('shows a summary with Edit buttons, a required consent and an optional marketing box', () => {
    reachReview();
    expect(screen.getByText('Pennant Heating and Plumbing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit Business/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /respond to my enquiry/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Send me occasional news/ })).not.toBeChecked();
  });

  it('refuses to send without consent and shows the error', () => {
    reachReview();
    fireEvent.click(screen.getByRole('button', { name: 'Send my request' }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Consent');
  });

  it('sends one JSON request of type agent-lead and shows the reference', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ ok: true, reference: 'IK-ABCD2345', delivery: 'sent' }),
    );
    reachReview();
    fireEvent.click(screen.getByRole('checkbox', { name: /respond to my enquiry/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Send my request' }));
    await waitFor(() => expect(screen.getByText('IK-ABCD2345')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/lead');
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).toMatchObject({
      type: 'agent-lead',
      businessName: 'Pennant Heating and Plumbing',
      industry: 'home-services',
      channel: 'both',
      plan: 'pro',
      billing: 'monthly',
      setupPreference: 'done-for-you',
      contactName: 'Alex Murray',
      email: 'alex@example.com',
      consent: true,
    });
    expect(screen.getByRole('status')).toHaveTextContent('Thank you, we have your request');
    expect(screen.getByRole('link', { name: siteEmail })).toHaveAttribute(
      'href',
      `mailto:${siteEmail}`,
    );
  });

  it('keeps every answer and offers the email fallback when delivery fails', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          ok: false,
          error: {
            code: 'delivery_failed',
            message: 'We could not send it.',
            reference: 'IK-ZZZZ2345',
          },
        },
        502,
      ),
    );
    reachReview();
    fireEvent.click(screen.getByRole('checkbox', { name: /respond to my enquiry/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Send my request' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('We could not send it.'),
    );
    expect(
      within(screen.getByRole('alert')).getByRole('link', { name: siteEmail }),
    ).toBeInTheDocument();
    expect(heading()).toHaveTextContent('Review and send');
    expect(screen.getByRole('checkbox', { name: /respond to my enquiry/ })).toBeChecked();

    // The retry resends the server reference so the send is idempotent.
    fetchMock.mockResolvedValue(
      jsonResponse({ ok: true, reference: 'IK-ZZZZ2345', delivery: 'sent' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Send my request' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const retry = JSON.parse(
      String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body),
    ) as Record<string, unknown>;
    expect(retry.clientReference).toBe('IK-ZZZZ2345');
  });

  it('treats an unparseable response as a failure, never a success', async () => {
    fetchMock.mockResolvedValue(new Response('<html>oops</html>', { status: 200 }));
    reachReview();
    fireEvent.click(screen.getByRole('checkbox', { name: /respond to my enquiry/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Send my request' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Please try again'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('IntakeForm safety', () => {
  it('has no payment or password fields and writes nothing to browser storage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const { container } = render(<IntakeForm prefill={{ plan: 'pro', channel: 'both' }} />);
    walkToContact();
    fillContact();
    next();
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(container.innerHTML).not.toMatch(/cc-number|cc-exp|cc-csc|card number|cvc|cvv/i);
    expect(setItem).not.toHaveBeenCalled();
    expect(document.cookie).toBe('');
  });
});

const siteEmail = 'admin@ikcloudsolutions.com';
