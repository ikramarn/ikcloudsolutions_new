'use client';

import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { QuizPanel } from '@/components/academy/QuizPanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import type { Course, Lesson } from '@/content/academy/courses';
import { allLessons, formatLessonDuration, nextLesson } from '@/lib/academy/course-stats';

interface LessonPlayerProps {
  course: Course;
  lessonId: string;
  completedLessonIds: readonly string[];
  quizResults: Readonly<Record<string, boolean>>;
  onSelectLesson: (lessonId: string) => void;
  onClose: () => void;
  onComplete: (lessonId: string) => void;
  onQuizAnswer: (lessonId: string, correct: boolean) => void;
}

function LessonTabs({
  course,
  lesson,
  quizResult,
  onQuizAnswer,
}: {
  course: Course;
  lesson: Lesson;
  quizResult: boolean | undefined;
  onQuizAnswer: (correct: boolean) => void;
}) {
  const tabs: TabItem[] = [
    {
      value: 'terminal',
      label: 'Terminal',
      content: (
        <div className="space-y-2">
          <p className="font-mono text-xs font-bold tracking-wider text-amber-200 uppercase">
            Illustrative output
          </p>
          <p className="text-sm text-slate-300">
            This output is an example written for the lesson. It was not produced by a real
            environment.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/60 p-4 font-mono text-xs text-slate-200">
            <span className="text-cyan-300">$ {lesson.terminalCommand}</span>
            {'\n'}
            {lesson.terminalOutput}
          </pre>
        </div>
      ),
    },
    {
      value: 'notes',
      label: 'Notes',
      content: (
        <div className="space-y-3 text-sm text-slate-200">
          {lesson.notes.split(/\n\s*\n/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ),
    },
    {
      value: 'quiz',
      label: 'Quiz',
      content: (
        <QuizPanel
          key={`${course.id}:${lesson.id}`}
          quiz={lesson.quiz}
          savedResult={quizResult}
          onAnswer={onQuizAnswer}
        />
      ),
    },
    {
      value: 'resources',
      label: 'Resources',
      content:
        lesson.resources.length === 0 ? (
          <p className="text-sm text-slate-300">No resources have been added to this lesson.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {lesson.resources.map((resource) => (
              <li key={resource.href}>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-8 items-center gap-1.5 text-cyan-300 underline underline-offset-2"
                >
                  {resource.label}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ),
    },
  ];
  return <Tabs tabs={tabs} label="Lesson material" />;
}

export function LessonPlayer({
  course,
  lessonId,
  completedLessonIds,
  quizResults,
  onSelectLesson,
  onClose,
  onComplete,
  onQuizAnswer,
}: LessonPlayerProps) {
  const lessons = allLessons(course);
  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0];
  if (!lesson) return null;

  const done = completedLessonIds.includes(lesson.id);
  const upNext = nextLesson(course, lesson.id);

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={lesson.title}
      description={`${course.title}. Sample lesson, not a paid course.`}
      className="sm:max-w-5xl"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div className="min-w-0 space-y-4">
          <video
            key={lesson.id}
            controls
            playsInline
            preload="none"
            src={lesson.videoUrl}
            className="aspect-video w-full rounded-lg bg-black"
          >
            Your browser cannot play this sample video.
          </video>
          <p className="text-sm text-slate-300">
            Placeholder sample video from a third party. It is not the lesson itself and has no
            captions. Planned length: {formatLessonDuration(lesson.durationSeconds)}.
          </p>
          <p className="text-slate-200">{lesson.summary}</p>
          <div className="flex flex-wrap items-center gap-3">
            {done ? (
              <Badge tone="new">Done</Badge>
            ) : (
              <Button size="sm" onClick={() => onComplete(lesson.id)}>
                Mark lesson as done
              </Button>
            )}
            {upNext ? (
              <Button size="sm" variant="secondary" onClick={() => onSelectLesson(upNext.id)}>
                Next lesson
              </Button>
            ) : null}
          </div>
          <LessonTabs
            key={lesson.id}
            course={course}
            lesson={lesson}
            quizResult={quizResults[`${course.id}:${lesson.id}`]}
            onQuizAnswer={(correct) => onQuizAnswer(lesson.id, correct)}
          />
        </div>
        <nav aria-label="Course lessons" className="space-y-4">
          {course.modules.map((module) => (
            <div key={module.id}>
              <h3 className="mb-2 text-sm font-bold text-white">{module.title}</h3>
              <ol className="space-y-1">
                {module.lessons.map((item) => {
                  const itemDone = completedLessonIds.includes(item.id);
                  const current = item.id === lesson.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-current={current ? 'true' : undefined}
                        onClick={() => onSelectLesson(item.id)}
                        className={`flex min-h-11 w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-white/10 ${current ? 'bg-white/10 text-white' : 'text-slate-300'}`}
                      >
                        {itemDone ? (
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-emerald-300"
                          />
                        ) : (
                          <Circle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        )}
                        <span>
                          {item.title}
                          {itemDone ? <span className="sr-only"> (done)</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </nav>
      </div>
    </Modal>
  );
}
