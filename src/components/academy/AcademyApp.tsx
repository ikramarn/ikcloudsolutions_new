'use client';

import { Search } from 'lucide-react';
import { useId, useMemo, useState, useSyncExternalStore } from 'react';
import { CourseCard } from '@/components/academy/CourseCard';
import { LessonPlayerLazy } from '@/components/academy/LessonPlayerLazy';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormControls';
import { Container } from '@/components/ui/Container';
import { Tabs } from '@/components/ui/Tabs';
import {
  CATEGORIES,
  LEVELS,
  sampleCourses,
  type Category,
  type Course,
  type Level,
} from '@/content/academy/courses';
import { allLessons } from '@/lib/academy/course-stats';
import { academyStore } from '@/lib/academy/store';

const SAVE_FAILED_MESSAGE = 'Progress cannot be saved in this browser';

async function celebrate(): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { default: confetti } = await import('canvas-confetti');
  void confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.7 },
    disableForReducedMotion: true,
  });
}

function matchesQuery(course: Course, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;
  return [course.title, course.subtitle, course.category, ...course.skills].some((text) =>
    text.toLowerCase().includes(needle),
  );
}

export function AcademyApp() {
  const state = useSyncExternalStore(
    academyStore.subscribe,
    academyStore.getSnapshot,
    academyStore.getServerSnapshot,
  );
  const searchId = useId();
  const levelId = useId();
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [level, setLevel] = useState<Level | 'All'>('All');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<{ courseId: string; lessonId: string } | null>(null);

  const courses = useMemo(() => [...sampleCourses, ...state.customCourses], [state.customCourses]);
  const filtered = courses.filter(
    (course) =>
      (category === 'All' || course.category === category) &&
      (level === 'All' || course.level === level) &&
      matchesQuery(course, query),
  );
  const enrolledCourses = courses.filter((course) => state.progress.enrolled.includes(course.id));
  const openCourse = open ? courses.find((course) => course.id === open.courseId) : undefined;

  function openCourseAt(course: Course) {
    const done = state.progress.completed[course.id] ?? [];
    const lessons = allLessons(course);
    const first = lessons.find((lesson) => !done.includes(lesson.id)) ?? lessons[0];
    if (first) setOpen({ courseId: course.id, lessonId: first.id });
  }

  function resetFilters() {
    setCategory('All');
    setLevel('All');
    setQuery('');
  }

  function renderGrid(list: readonly Course[], emptyMessage: string, showReset: boolean) {
    if (list.length === 0) {
      return (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-slate-200">{emptyMessage}</p>
          {showReset ? (
            <Button className="mt-4" size="sm" variant="secondary" onClick={resetFilters}>
              Reset filters
            </Button>
          ) : null}
        </div>
      );
    }
    return (
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {list.map((course) => (
          <li key={course.id} className="flex">
            <div className="w-full">
              <CourseCard
                course={course}
                enrolled={state.progress.enrolled.includes(course.id)}
                completedLessonIds={state.progress.completed[course.id] ?? []}
                onOpen={openCourseAt}
                onToggleEnrolled={(item, enrolled) => academyStore.setEnrolled(item.id, enrolled)}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Container className="space-y-6 py-12">
      <div role="status" aria-live="polite">
        {state.saveFailed ? (
          <p className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {SAVE_FAILED_MESSAGE}. You can keep using the demo, but your progress will be lost when
            you leave this page.
          </p>
        ) : null}
      </div>

      <section aria-labelledby={`${searchId}-filters`} className="space-y-4">
        <h2 id={`${searchId}-filters`} className="text-2xl font-extrabold text-white">
          Sample courses
        </h2>
        <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
          <div className="space-y-1.5">
            <label htmlFor={searchId} className="block text-sm font-semibold text-slate-100">
              Search courses
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-3.5 left-3 size-4 text-slate-400"
              />
              <Input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Kubernetes, Terraform, AWS..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={levelId} className="block text-sm font-semibold text-slate-100">
              Level
            </label>
            <Select
              id={levelId}
              value={level}
              onChange={(event) => setLevel(event.target.value as Level | 'All')}
            >
              <option value="All">All levels</option>
              {LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
          {(['All', ...CATEGORIES] as const).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={category === item ? 'primary' : 'secondary'}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item === 'All' ? 'All categories' : item}
            </Button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="font-mono text-xs text-slate-300">
          Showing {filtered.length} of {courses.length} courses
        </p>
      </section>

      <Tabs
        label="Courses"
        tabs={[
          {
            value: 'catalogue',
            label: 'Catalogue',
            content: renderGrid(filtered, 'No courses match your search.', true),
          },
          {
            value: 'enrolled',
            label: `Enrolled (${enrolledCourses.length})`,
            content: renderGrid(
              enrolledCourses,
              'You have not enrolled in a course yet. Enrolling only sets a flag in this browser.',
              false,
            ),
          },
        ]}
      />

      {open && openCourse ? (
        <LessonPlayerLazy
          course={openCourse}
          lessonId={open.lessonId}
          completedLessonIds={state.progress.completed[openCourse.id] ?? []}
          quizResults={state.progress.quiz}
          onSelectLesson={(lessonId) => setOpen({ courseId: openCourse.id, lessonId })}
          onClose={() => setOpen(null)}
          onComplete={(lessonId) => {
            academyStore.completeLesson(openCourse.id, lessonId);
            void celebrate();
          }}
          onQuizAnswer={(lessonId, correct) =>
            academyStore.recordQuiz(openCourse.id, lessonId, correct)
          }
        />
      ) : null}
    </Container>
  );
}
