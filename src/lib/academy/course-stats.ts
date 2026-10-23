import type { Course, Lesson } from '@/content/academy/courses';

export function allLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function lessonCount(course: Course): number {
  return allLessons(course).length;
}

/** Course length is the sum of its lesson lengths, never a typed total. */
export function courseSeconds(course: Course): number {
  return allLessons(course).reduce((total, lesson) => total + lesson.durationSeconds, 0);
}

/** 1104 -> '18:24' */
export function formatLessonDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

/** 4500 -> '1h 15m', 1500 -> '25 min' (rounded to the nearest minute). */
export function formatCourseDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

/** Whole-number percentage of a course's lessons that are completed. */
export function percentComplete(course: Course, completedLessonIds: readonly string[]): number {
  const lessons = allLessons(course);
  if (lessons.length === 0) return 0;
  const done = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  return Math.round((done / lessons.length) * 100);
}

export function completedCount(course: Course, completedLessonIds: readonly string[]): number {
  return allLessons(course).filter((lesson) => completedLessonIds.includes(lesson.id)).length;
}

/** The lesson after `lessonId` in course order, or undefined for the last lesson. */
export function nextLesson(course: Course, lessonId: string): Lesson | undefined {
  const lessons = allLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 ? lessons[index + 1] : undefined;
}
