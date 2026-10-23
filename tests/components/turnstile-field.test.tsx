import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import {
  TURNSTILE_LOAD_TIMEOUT_MS,
  TurnstileField,
  type TurnstileFieldHandle,
} from '@/components/forms/TurnstileField';
import { siteConfig } from '@/config/site';

interface MockProps {
  siteKey: string;
  onSuccess?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  ref?: React.Ref<{ reset: () => void }>;
}

const widget = vi.hoisted(() => ({
  props: null as unknown as MockProps,
  reset: vi.fn(),
  mounts: 0,
}));

vi.mock('@marsidev/react-turnstile', async () => {
  const { useEffect, useImperativeHandle } = await import('react');
  function Turnstile(props: MockProps) {
    const { ref } = props;
    useImperativeHandle(ref, () => ({ reset: widget.reset }));
    useEffect(() => {
      widget.mounts += 1;
    }, []);
    useEffect(() => {
      widget.props = props;
    });
    return <div data-testid="turnstile-widget" data-sitekey={props.siteKey} />;
  }
  return { Turnstile };
});

const alertText = /We could not load the spam check/;

beforeEach(() => {
  widget.reset.mockClear();
  widget.mounts = 0;
});

function setup(props: Partial<React.ComponentProps<typeof TurnstileField>> = {}) {
  const onTokenChange = vi.fn();
  const view = render(
    <TurnstileField active siteKey="site-key" onTokenChange={onTokenChange} {...props} />,
  );
  return { onTokenChange, ...view };
}

describe('TurnstileField rendering', () => {
  it('renders nothing without a site key', () => {
    const { container } = setup({ siteKey: undefined });
    expect(container).toBeEmptyDOMElement();
    expect(widget.mounts).toBe(0);
  });

  it('renders nothing until the form is active (lazy mount)', () => {
    const { container, rerender } = setup({ active: false });
    expect(container).toBeEmptyDOMElement();
    expect(widget.mounts).toBe(0);
    rerender(<TurnstileField active siteKey="site-key" onTokenChange={vi.fn()} />);
    expect(screen.getByTestId('turnstile-widget')).toHaveAttribute('data-sitekey', 'site-key');
    expect(widget.mounts).toBe(1);
  });
});

describe('TurnstileField token lifecycle', () => {
  it('reports the token on success', () => {
    const { onTokenChange } = setup();
    act(() => widget.props.onSuccess?.('token-1'));
    expect(onTokenChange).toHaveBeenLastCalledWith('token-1');
  });

  it('clears the token and resets the widget when it expires', () => {
    const { onTokenChange } = setup();
    act(() => widget.props.onSuccess?.('token-1'));
    act(() => widget.props.onExpire?.());
    expect(onTokenChange).toHaveBeenLastCalledWith(null);
    expect(widget.reset).toHaveBeenCalledTimes(1);
  });

  it('exposes reset() so the form can discard a spent token after a failed submit', () => {
    const ref = createRef<TurnstileFieldHandle>();
    const { onTokenChange } = setup({ ref });
    act(() => widget.props.onSuccess?.('token-1'));
    act(() => ref.current?.reset());
    expect(widget.reset).toHaveBeenCalledTimes(1);
    expect(onTokenChange).toHaveBeenLastCalledWith(null);
  });
});

describe('TurnstileField blocked-widget fallback (A7)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows the alert and mailto after 10 s without a token', () => {
    setup();
    act(() => {
      vi.advanceTimersByTime(TURNSTILE_LOAD_TIMEOUT_MS - 1);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(alertText);
    expect(screen.getByRole('link', { name: siteConfig.email })).toHaveAttribute(
      'href',
      `mailto:${siteConfig.email}`,
    );
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('does not show the alert when a token arrives in time', () => {
    setup();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => widget.props.onSuccess?.('token-1'));
    act(() => {
      vi.advanceTimersByTime(TURNSTILE_LOAD_TIMEOUT_MS * 2);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not start the timer before the widget is mounted', () => {
    setup({ active: false });
    act(() => {
      vi.advanceTimersByTime(TURNSTILE_LOAD_TIMEOUT_MS * 2);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the alert after onError fires twice, resetting the widget after the first', () => {
    const { onTokenChange } = setup();
    act(() => widget.props.onError?.());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(widget.reset).toHaveBeenCalledTimes(1);
    act(() => widget.props.onError?.());
    expect(screen.getByRole('alert')).toHaveTextContent(alertText);
    expect(onTokenChange).toHaveBeenLastCalledWith(null);
  });

  it('"Try again" remounts the widget, clears the alert and resets the counters', () => {
    const { onTokenChange } = setup();
    act(() => vi.advanceTimersByTime(TURNSTILE_LOAD_TIMEOUT_MS));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(widget.mounts).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(widget.mounts).toBe(2);
    expect(onTokenChange).toHaveBeenLastCalledWith(null);

    // The error counter restarted: one error is not enough for the alert again.
    act(() => widget.props.onError?.());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // And the 10 s timer restarted too.
    act(() => vi.advanceTimersByTime(TURNSTILE_LOAD_TIMEOUT_MS));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('clears the alert when a token finally arrives', () => {
    const { onTokenChange } = setup();
    act(() => vi.advanceTimersByTime(TURNSTILE_LOAD_TIMEOUT_MS));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => widget.props.onSuccess?.('late-token'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onTokenChange).toHaveBeenLastCalledWith('late-token');
  });

  describe('phone number', () => {
    const mutable = siteConfig as unknown as { phone: string | undefined };
    afterEach(() => {
      mutable.phone = undefined;
    });

    it('is not mentioned by default (siteConfig.phone is undefined)', () => {
      setup();
      act(() => vi.advanceTimersByTime(TURNSTILE_LOAD_TIMEOUT_MS));
      expect(screen.getByRole('alert')).not.toHaveTextContent('call');
    });

    it('is offered when siteConfig.phone is set', () => {
      mutable.phone = '01592 000000';
      setup();
      act(() => vi.advanceTimersByTime(TURNSTILE_LOAD_TIMEOUT_MS));
      expect(screen.getByRole('alert')).toHaveTextContent('or call 01592 000000');
    });
  });
});
