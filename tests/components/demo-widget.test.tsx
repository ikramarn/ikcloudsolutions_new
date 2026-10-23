import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DemoWidget } from '@/components/agents/DemoWidget';
import { getScenario } from '@/content/agents/demos';

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  stubReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('DemoWidget', () => {
  it('always shows the SIMULATED label and caption, and plays no audio', () => {
    const { container } = render(<DemoWidget scenarioId="general-voice" />);
    expect(screen.getByText('Simulated')).toBeInTheDocument();
    expect(screen.getByText(/Simulated demo: scripted conversation/)).toBeInTheDocument();
    expect(container.querySelector('audio')).toBeNull();
    expect(container.querySelector('video')).toBeNull();
  });

  it('shows the whole transcript and the owner summary instantly', () => {
    const scenario = getScenario('clinics-voice');
    render(<DemoWidget scenarioId="clinics-voice" />);
    expect(screen.queryByText(/NHS 111/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show full transcript' }));
    const log = screen.getByRole('log', { name: 'Simulated conversation' });
    expect(log.querySelectorAll('li')).toHaveLength(scenario?.turns.length ?? 0);
    expect(log).toHaveTextContent(/NHS 111/);
    expect(screen.getByText('What the owner receives (example)')).toBeInTheDocument();
  });

  it('exposes the transcript as a polite live log', () => {
    render(<DemoWidget scenarioId="general-voice" />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('plays turn by turn with Play and Pause', async () => {
    vi.useFakeTimers();
    render(<DemoWidget scenarioId="general-whatsapp" />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    const log = screen.getByRole('log');
    expect(log.querySelectorAll('li').length).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(log.querySelectorAll('li').length).toBe(1);
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('reaches the end when played through and offers WhatsApp quick replies', async () => {
    vi.useFakeTimers();
    render(<DemoWidget scenarioId="general-whatsapp" />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(screen.getByText('What the owner receives (example)')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'See a dental practice example' }),
    ).toBeInTheDocument();
  });

  it('branches to another scripted scenario from a quick reply', async () => {
    render(<DemoWidget scenarioId="general-whatsapp" />);
    fireEvent.click(screen.getByRole('button', { name: 'Show full transcript' }));
    fireEvent.click(screen.getByRole('button', { name: 'See an estate agent example' }));
    expect(
      screen.getByRole('heading', { name: 'A viewing request, then a boiler fault' }),
    ).toBeInTheDocument();
  });

  it('shows the full transcript by default under prefers-reduced-motion', () => {
    stubReducedMotion(true);
    const scenario = getScenario('general-voice');
    render(<DemoWidget scenarioId="general-voice" />);
    const log = screen.getByRole('log');
    expect(log.querySelectorAll('li')).toHaveLength(scenario?.turns.length ?? 0);
    expect(screen.queryByRole('button', { name: 'Show full transcript' })).not.toBeInTheDocument();
  });

  it('is operable by keyboard: every control is a real button', () => {
    render(<DemoWidget scenarioId="general-voice" />);
    for (const button of screen.getAllByRole('button')) {
      expect(button.tagName).toBe('BUTTON');
      expect(button).not.toHaveAttribute('tabindex', '-1');
    }
  });

  it('writes no state and logs no error after unmount', async () => {
    vi.useFakeTimers();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { unmount } = render(<DemoWidget scenarioId="general-voice" />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    errors.mockRestore();
  });

  it('reports an unknown scenario instead of crashing', () => {
    render(<DemoWidget scenarioId="missing" />);
    expect(screen.getByRole('alert')).toHaveTextContent('That demo is not available.');
  });
});
