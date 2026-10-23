import { describe, expect, it } from 'vitest';
import { sampleCourses } from '@/content/academy/courses';
import {
  completedCount,
  courseSeconds,
  formatCourseDuration,
  formatLessonDuration,
  lessonCount,
  nextLesson,
  percentComplete,
} from '@/lib/academy/course-stats';
import { parseCustomCourses, parseProgress } from '@/lib/academy/schema';
import {
  buildCourse,
  buildLesson,
  emptyCourseForm,
  emptyLessonForm,
  lessonToForm,
  validateCourseForm,
  validateLessonForm,
  withLesson,
  withoutLesson,
} from '@/lib/academy/studio-forms';

const first = sampleCourses[0]!;

describe('sample course content', () => {
  it('has unique ids and a quiz whose correct index exists in every lesson', () => {
    const ids = sampleCourses.map((course) => course.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const course of sampleCourses) {
      for (const part of course.modules) {
        for (const lesson of part.lessons) {
          expect(lesson.quiz.options.length, lesson.id).toBeGreaterThanOrEqual(2);
          expect(lesson.quiz.options[lesson.quiz.correctIndex], lesson.id).toBeDefined();
        }
      }
    }
  });

  it('carries no ratings, enrolment counts, badges, trainers or certification fields', () => {
    const keys = new Set<string>();
    const walk = (value: unknown) => {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
          keys.add(key.toLowerCase());
          walk(child);
        }
      }
    };
    walk(sampleCourses);
    for (const forbidden of [
      'rating',
      'reviewscount',
      'enrolments',
      'badge',
      'trainer',
      'certification',
    ]) {
      expect(keys.has(forbidden), forbidden).toBe(false);
    }
  });

  it('never mentions certification in its text', () => {
    expect(JSON.stringify(sampleCourses).toLowerCase()).not.toMatch(/certif|rated|\d+ reviews/);
  });

  it('uses no remote stock photos', () => {
    expect(JSON.stringify(sampleCourses)).not.toContain('unsplash');
  });
});

describe('course stats', () => {
  it('computes a course length from its lesson lengths', () => {
    const sum = first.modules
      .flatMap((module) => module.lessons)
      .reduce((total, lesson) => total + lesson.durationSeconds, 0);
    expect(courseSeconds(first)).toBe(sum);
    expect(lessonCount(first)).toBe(3);
  });

  it('formats lesson and course durations', () => {
    expect(formatLessonDuration(1104)).toBe('18:24');
    expect(formatLessonDuration(65)).toBe('1:05');
    expect(formatCourseDuration(4500)).toBe('1h 15m');
    expect(formatCourseDuration(1500)).toBe('25 min');
  });

  it('computes progress and the next lesson', () => {
    expect(percentComplete(first, [])).toBe(0);
    expect(percentComplete(first, ['k8s-control-plane'])).toBe(33);
    expect(completedCount(first, ['k8s-control-plane', 'unknown'])).toBe(1);
    expect(nextLesson(first, 'k8s-control-plane')?.id).toBe('k8s-deployments');
    expect(nextLesson(first, 'k8s-argocd-sync')).toBeUndefined();
  });
});

describe('stored data parsing', () => {
  it('returns empty progress for missing or corrupt data', () => {
    expect(parseProgress(null)).toEqual({ enrolled: [], completed: {}, quiz: {} });
    expect(parseProgress('{oops')).toEqual({ enrolled: [], completed: {}, quiz: {} });
    expect(parseProgress('{"enrolled":"x"}')).toEqual({ enrolled: [], completed: {}, quiz: {} });
  });

  it('keeps valid custom courses and drops invalid ones', () => {
    const valid = buildCourse({ ...emptyCourseForm(), title: 'Mine' });
    const bad = { ...valid, id: 'bad', modules: [{ id: 'm', title: 'M', lessons: [{ id: 1 }] }] };
    const parsed = parseCustomCourses(JSON.stringify([valid, bad, 'x']));
    expect(parsed.map((course) => course.title)).toEqual(['Mine']);
    expect(parsed[0]?.custom).toBe(true);
  });

  it('rejects a lesson video address that is not http or https', () => {
    const lesson = buildLesson({
      ...emptyLessonForm(),
      title: 'L',
      quizQuestion: 'Q?',
      quizOptions: 'a\nb',
    });
    const course = withLesson(buildCourse({ ...emptyCourseForm(), title: 'C' }), {
      ...lesson,
      videoUrl: 'javascript:alert(1)',
    });
    expect(parseCustomCourses(JSON.stringify([course]))).toEqual([]);
  });
});

describe('course editor forms', () => {
  it('requires a course title and limits skills', () => {
    expect(validateCourseForm(emptyCourseForm()).title).toBeDefined();
    expect(
      validateCourseForm({ ...emptyCourseForm(), title: 'T', skills: 'a,b,c,d,e,f,g,h,i' }).skills,
    ).toBeDefined();
    expect(validateCourseForm({ ...emptyCourseForm(), title: 'T' })).toEqual({});
  });

  it('validates the lesson form fields', () => {
    const errors = validateLessonForm(emptyLessonForm());
    expect(errors.title).toBeDefined();
    expect(errors.quizQuestion).toBeDefined();
    expect(errors.quizOptions).toBeDefined();

    const filled = {
      ...emptyLessonForm(),
      title: 'Lesson',
      quizQuestion: 'Which?',
      quizOptions: 'one\ntwo\nthree',
      quizCorrect: '2',
    };
    expect(validateLessonForm(filled)).toEqual({});
    expect(validateLessonForm({ ...filled, quizCorrect: '4' }).quizCorrect).toBeDefined();
    expect(validateLessonForm({ ...filled, videoUrl: 'ftp://x' }).videoUrl).toBeDefined();
    expect(validateLessonForm({ ...filled, minutes: '0' }).minutes).toBeDefined();
  });

  it('builds, edits and removes lessons without touching other lessons', () => {
    const course = buildCourse({ ...emptyCourseForm(), title: 'C' });
    const one = buildLesson({
      ...emptyLessonForm(),
      title: 'One',
      quizQuestion: 'Q?',
      quizOptions: 'a\nb',
      quizCorrect: '2',
    });
    const two = buildLesson({
      ...emptyLessonForm(),
      title: 'Two',
      quizQuestion: 'Q?',
      quizOptions: 'a\nb',
    });
    let current = withLesson(withLesson(course, one), two);
    expect(lessonCount(current)).toBe(2);
    expect(one.quiz.correctIndex).toBe(1);
    expect(one.durationSeconds).toBe(600);

    const edited = buildLesson({ ...lessonToForm(one), title: 'One edited' }, one.id);
    current = withLesson(current, edited);
    expect(current.modules[0]?.lessons.map((lesson) => lesson.title)).toEqual([
      'One edited',
      'Two',
    ]);

    current = withoutLesson(current, one.id);
    expect(current.modules[0]?.lessons.map((lesson) => lesson.title)).toEqual(['Two']);
  });
});
