import type { Course } from '@/content/academy/courses';
import {
  MAX_CUSTOM_COURSES,
  emptyProgress,
  parseCustomCourses,
  parseProgress,
  type Progress,
} from '@/lib/academy/schema';
import { safeStorage } from '@/lib/storage';

export const PROGRESS_KEY = 'ik_academy_progress_v1';
export const COURSES_KEY = 'ik_academy_courses_v1';

export interface AcademyState {
  progress: Progress;
  customCourses: Course[];
  /** True after a write failed (storage blocked or full). The demo still works for the session. */
  saveFailed: boolean;
}

const EMPTY_STATE: AcademyState = {
  progress: emptyProgress(),
  customCourses: [],
  saveFailed: false,
};

let state: AcademyState = EMPTY_STATE;
let loaded = false;
const listeners = new Set<() => void>();

// Reading is lazy and happens on the client only. Nothing is ever WRITTEN here except as the direct
// result of a user action below, so merely opening the Academy leaves storage untouched.
function load(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  state = {
    progress: parseProgress(safeStorage.get(PROGRESS_KEY)),
    customCourses: parseCustomCourses(safeStorage.get(COURSES_KEY)),
    saveFailed: false,
  };
}

function commit(next: AcademyState, writes: { progress?: boolean; courses?: boolean }): void {
  let ok = true;
  if (writes.progress) ok = safeStorage.set(PROGRESS_KEY, JSON.stringify(next.progress)) && ok;
  if (writes.courses) ok = safeStorage.set(COURSES_KEY, JSON.stringify(next.customCourses)) && ok;
  state = { ...next, saveFailed: !ok };
  for (const listener of listeners) listener();
}

function withProgress(change: (progress: Progress) => Progress): void {
  load();
  commit({ ...state, progress: change(state.progress) }, { progress: true });
}

export const academyStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): AcademyState {
    load();
    return state;
  },
  getServerSnapshot(): AcademyState {
    return EMPTY_STATE;
  },

  setEnrolled(courseId: string, enrolled: boolean): void {
    withProgress((progress) => {
      const rest = progress.enrolled.filter((id) => id !== courseId);
      return { ...progress, enrolled: enrolled ? [...rest, courseId] : rest };
    });
  },

  completeLesson(courseId: string, lessonId: string): void {
    withProgress((progress) => {
      const done = progress.completed[courseId] ?? [];
      if (done.includes(lessonId)) return progress;
      return { ...progress, completed: { ...progress.completed, [courseId]: [...done, lessonId] } };
    });
  },

  recordQuiz(courseId: string, lessonId: string, correct: boolean): void {
    withProgress((progress) => ({
      ...progress,
      quiz: { ...progress.quiz, [`${courseId}:${lessonId}`]: correct },
    }));
  },

  /** Adds or replaces a course made in the course editor. Returns false at the course limit. */
  saveCourse(course: Course): boolean {
    load();
    const exists = state.customCourses.some((item) => item.id === course.id);
    if (!exists && state.customCourses.length >= MAX_CUSTOM_COURSES) return false;
    const customCourses = exists
      ? state.customCourses.map((item) => (item.id === course.id ? course : item))
      : [...state.customCourses, course];
    commit({ ...state, customCourses }, { courses: true });
    return true;
  },

  deleteCourse(courseId: string): void {
    load();
    const customCourses = state.customCourses.filter((item) => item.id !== courseId);
    const progress: Progress = {
      enrolled: state.progress.enrolled.filter((id) => id !== courseId),
      completed: Object.fromEntries(
        Object.entries(state.progress.completed).filter(([id]) => id !== courseId),
      ),
      quiz: Object.fromEntries(
        Object.entries(state.progress.quiz).filter(([key]) => !key.startsWith(`${courseId}:`)),
      ),
    };
    commit({ ...state, customCourses, progress }, { courses: true, progress: true });
  },

  /** Test helper: forgets everything and re-reads storage on next use. */
  reset(): void {
    state = EMPTY_STATE;
    loaded = false;
    for (const listener of listeners) listener();
  },
};
