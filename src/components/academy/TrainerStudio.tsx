'use client';

import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { CourseForm, LessonForm } from '@/components/academy/StudioForms';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Modal } from '@/components/ui/Modal';
import { sampleCourses } from '@/content/academy/courses';
import {
  courseSeconds,
  formatCourseDuration,
  formatLessonDuration,
  lessonCount,
} from '@/lib/academy/course-stats';
import { academyStore } from '@/lib/academy/store';
import {
  buildCourse,
  buildLesson,
  courseToForm,
  emptyCourseForm,
  emptyLessonForm,
  lessonToForm,
  withLesson,
  withoutLesson,
} from '@/lib/academy/studio-forms';

type Dialog =
  | { kind: 'course'; courseId?: string }
  | { kind: 'lesson'; courseId: string; lessonId?: string }
  | { kind: 'delete-course'; courseId: string }
  | { kind: 'delete-lesson'; courseId: string; lessonId: string };

export function TrainerStudio() {
  const state = useSyncExternalStore(
    academyStore.subscribe,
    academyStore.getSnapshot,
    academyStore.getServerSnapshot,
  );
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const target =
    dialog && 'courseId' in dialog && dialog.courseId
      ? state.customCourses.find((course) => course.id === dialog.courseId)
      : undefined;
  const close = () => setDialog(null);

  return (
    <Container className="space-y-8 py-12">
      <div role="status" aria-live="polite">
        {state.saveFailed ? (
          <p className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Progress cannot be saved in this browser. Your changes will be lost when you leave this
            page.
          </p>
        ) : null}
        {limitReached ? (
          <p className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            The demo editor holds up to 20 courses. Delete one to add another.
          </p>
        ) : null}
      </div>

      <section aria-labelledby="studio-mine" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="studio-mine" className="text-2xl font-extrabold text-white">
            Your demo courses
          </h2>
          <Button onClick={() => setDialog({ kind: 'course' })}>
            <Plus aria-hidden="true" className="size-4" />
            New course
          </Button>
        </div>
        <p className="text-sm text-slate-300">
          Courses you make here are saved only in this browser, after you press save. They appear in
          the{' '}
          <Link href="/academy" className="text-cyan-300 underline">
            Academy demo
          </Link>{' '}
          on this device and nowhere else.
        </p>
        {state.customCourses.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-200">
            You have not made a course yet.
          </div>
        ) : (
          <ul className="space-y-4">
            {state.customCourses.map((course) => (
              <li key={course.id} className="glass-card space-y-3 rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                    <p className="font-mono text-xs text-slate-300">
                      {course.category} &middot; {course.level} &middot; {lessonCount(course)}{' '}
                      {lessonCount(course) === 1 ? 'lesson' : 'lessons'} &middot;{' '}
                      {formatCourseDuration(courseSeconds(course))}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDialog({ kind: 'lesson', courseId: course.id })}
                    >
                      <Plus aria-hidden="true" className="size-4" />
                      Add lesson<span className="sr-only"> to {course.title}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDialog({ kind: 'course', courseId: course.id })}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                      Edit<span className="sr-only"> {course.title}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDialog({ kind: 'delete-course', courseId: course.id })}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Delete<span className="sr-only"> {course.title}</span>
                    </Button>
                  </div>
                </div>
                {lessonCount(course) > 0 ? (
                  <ol className="space-y-1 text-sm">
                    {course.modules
                      .flatMap((module) => module.lessons)
                      .map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-1.5"
                        >
                          <span className="text-slate-200">
                            {lesson.title}{' '}
                            <span className="font-mono text-xs text-slate-300">
                              ({formatLessonDuration(lesson.durationSeconds)})
                            </span>
                          </span>
                          <span className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setDialog({
                                  kind: 'lesson',
                                  courseId: course.id,
                                  lessonId: lesson.id,
                                })
                              }
                            >
                              Edit<span className="sr-only"> lesson {lesson.title}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setDialog({
                                  kind: 'delete-lesson',
                                  courseId: course.id,
                                  lessonId: lesson.id,
                                })
                              }
                            >
                              Delete<span className="sr-only"> lesson {lesson.title}</span>
                            </Button>
                          </span>
                        </li>
                      ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-300">This course has no lessons yet.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="studio-samples" className="space-y-3">
        <h2 id="studio-samples" className="text-xl font-bold text-white">
          Sample courses (read only)
        </h2>
        <ul className="space-y-2 text-sm text-slate-200">
          {sampleCourses.map((course) => (
            <li key={course.id} className="flex flex-wrap items-center gap-2">
              <Badge tone="demo">Sample</Badge>
              {course.title}
            </li>
          ))}
        </ul>
      </section>

      {dialog?.kind === 'course' ? (
        <Modal
          open
          onOpenChange={(open) => !open && close()}
          title={target ? 'Edit course' : 'New course'}
          description="Saved only in this browser."
        >
          <CourseForm
            initial={target ? courseToForm(target) : emptyCourseForm()}
            submitLabel={target ? 'Save course' : 'Create course'}
            onCancel={close}
            onSubmit={(values) => {
              const saved = academyStore.saveCourse(buildCourse(values, target));
              setLimitReached(!saved);
              close();
            }}
          />
        </Modal>
      ) : null}

      {dialog?.kind === 'lesson' && target ? (
        <Modal
          open
          onOpenChange={(open) => !open && close()}
          title={dialog.lessonId ? 'Edit lesson' : 'Add lesson'}
          description={target.title}
          className="sm:max-w-2xl"
        >
          <LessonForm
            initial={(() => {
              const existing = target.modules
                .flatMap((module) => module.lessons)
                .find((lesson) => lesson.id === dialog.lessonId);
              return existing ? lessonToForm(existing) : emptyLessonForm();
            })()}
            submitLabel={dialog.lessonId ? 'Save lesson' : 'Add lesson'}
            onCancel={close}
            onSubmit={(values) => {
              academyStore.saveCourse(withLesson(target, buildLesson(values, dialog.lessonId)));
              close();
            }}
          />
        </Modal>
      ) : null}

      {dialog?.kind === 'delete-course' && target ? (
        <Modal
          open
          onOpenChange={(open) => !open && close()}
          title="Delete this course?"
          description={`"${target.title}" and its saved progress will be removed from this browser.`}
        >
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                academyStore.deleteCourse(target.id);
                setLimitReached(false);
                close();
              }}
            >
              Delete course
            </Button>
            <Button variant="secondary" onClick={close}>
              Keep course
            </Button>
          </div>
        </Modal>
      ) : null}

      {dialog?.kind === 'delete-lesson' && target ? (
        <Modal
          open
          onOpenChange={(open) => !open && close()}
          title="Delete this lesson?"
          description={target.title}
        >
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                academyStore.saveCourse(withoutLesson(target, dialog.lessonId));
                close();
              }}
            >
              Delete lesson
            </Button>
            <Button variant="secondary" onClick={close}>
              Keep lesson
            </Button>
          </div>
        </Modal>
      ) : null}
    </Container>
  );
}
