import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AcademyApp } from '@/components/academy/AcademyApp';
import { TrainerStudio } from '@/components/academy/TrainerStudio';
import { academyStore, COURSES_KEY, PROGRESS_KEY } from '@/lib/academy/store';

const MESSAGE = /Progress cannot be saved in this browser/;

beforeEach(() => {
  window.localStorage.clear();
  academyStore.reset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function blockStorage() {
  const blocked = () => {
    throw new DOMException('Storage is blocked', 'SecurityError');
  };
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked);
}

describe('Academy with blocked storage', () => {
  it('renders without crashing and shows no message before any action', () => {
    blockStorage();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AcademyApp />)).not.toThrow();
    expect(screen.getByRole('heading', { name: 'Sample courses' })).toBeInTheDocument();
    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('shows the message and keeps working in memory after the learner enrols', () => {
    blockStorage();
    render(<AcademyApp />);
    fireEvent.click(screen.getAllByRole('button', { name: /^Enrol/ })[0]!);
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    // The session still reflects the choice even though nothing could be saved.
    expect(screen.getAllByRole('button', { name: /^Enrolled/ })).toHaveLength(1);
    expect(screen.getByRole('tab', { name: 'Enrolled (1)' })).toBeInTheDocument();
  });

  it('survives a blocked write when a lesson is completed or a quiz is answered', () => {
    blockStorage();
    expect(() => {
      academyStore.completeLesson('kubernetes-gitops', 'k8s-control-plane');
      academyStore.recordQuiz('kubernetes-gitops', 'k8s-control-plane', true);
    }).not.toThrow();
    expect(academyStore.getSnapshot().saveFailed).toBe(true);
    expect(academyStore.getSnapshot().progress.completed['kubernetes-gitops']).toEqual([
      'k8s-control-plane',
    ]);
  });

  it('shows the message in the course editor when a course cannot be saved', () => {
    blockStorage();
    render(<TrainerStudio />);
    fireEvent.click(screen.getByRole('button', { name: 'New course' }));
    fireEvent.change(screen.getByLabelText(/Course title/), { target: { value: 'My course' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create course' }));
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My course' })).toBeInTheDocument();
  });
});

describe('Academy storage writes', () => {
  it('writes nothing until the learner acts', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<AcademyApp />);
    expect(setItem).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(PROGRESS_KEY)).toBeNull();
    expect(window.localStorage.getItem(COURSES_KEY)).toBeNull();
  });

  it('saves progress under the versioned key after a user action', () => {
    render(<AcademyApp />);
    fireEvent.click(screen.getAllByRole('button', { name: /^Enrol/ })[0]!);
    const saved = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? '{}') as {
      enrolled: string[];
    };
    expect(saved.enrolled).toEqual(['kubernetes-gitops']);
    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
  });

  it('ignores corrupt stored data instead of crashing', () => {
    window.localStorage.setItem(PROGRESS_KEY, '{not json');
    window.localStorage.setItem(COURSES_KEY, JSON.stringify([{ id: 1 }, 'x']));
    academyStore.reset();
    expect(() => render(<AcademyApp />)).not.toThrow();
    expect(academyStore.getSnapshot().customCourses).toEqual([]);
  });
});
