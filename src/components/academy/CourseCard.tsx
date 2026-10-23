import { Boxes, Cloud, Layers, PlayCircle, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Course, ThumbnailGradient, ThumbnailIcon } from '@/content/academy/courses';
import {
  courseSeconds,
  formatCourseDuration,
  lessonCount,
  percentComplete,
  completedCount,
} from '@/lib/academy/course-stats';

const icons: Record<ThumbnailIcon, LucideIcon> = {
  boxes: Boxes,
  cloud: Cloud,
  layers: Layers,
  'shield-check': ShieldCheck,
};

// Full class names so Tailwind can see them. Generated gradients replace remote stock photos.
const gradients: Record<ThumbnailGradient, string> = {
  cyan: 'from-cyan-700/60 via-slate-900 to-blue-950',
  violet: 'from-violet-700/60 via-slate-900 to-indigo-950',
  emerald: 'from-emerald-700/50 via-slate-900 to-teal-950',
  amber: 'from-amber-600/50 via-slate-900 to-orange-950',
};

export function CourseThumbnail({ course, className }: { course: Course; className?: string }) {
  const Icon = icons[course.thumbnail.icon];
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-gradient-to-br ${gradients[course.thumbnail.gradient]} ${className ?? 'aspect-video w-full'}`}
    >
      <Icon className="size-10 text-white/80" />
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  enrolled: boolean;
  completedLessonIds: readonly string[];
  onOpen: (course: Course) => void;
  onToggleEnrolled: (course: Course, enrolled: boolean) => void;
}

export function CourseCard({
  course,
  enrolled,
  completedLessonIds,
  onOpen,
  onToggleEnrolled,
}: CourseCardProps) {
  const total = lessonCount(course);
  const done = completedCount(course, completedLessonIds);
  const percent = percentComplete(course, completedLessonIds);
  const started = done > 0;

  return (
    <article className="glass-card flex flex-col overflow-hidden rounded-2xl">
      <CourseThumbnail course={course} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{course.level}</Badge>
          <Badge tone={course.custom ? 'draft' : 'demo'}>
            {course.custom ? 'Made in the editor' : 'Sample'}
          </Badge>
        </div>
        <h3 className="text-lg font-bold text-white">{course.title}</h3>
        <p className="text-sm text-slate-300">{course.subtitle}</p>
        <p className="font-mono text-xs text-slate-300">
          {course.category} &middot; {total} {total === 1 ? 'lesson' : 'lessons'} &middot;{' '}
          {formatCourseDuration(courseSeconds(course))}
        </p>
        {course.skills.length > 0 ? (
          <ul aria-label="Skills covered" className="flex flex-wrap gap-1.5">
            {course.skills.slice(0, 4).map((skill) => (
              <li
                key={skill}
                className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-200"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : null}
        {enrolled ? (
          <div className="space-y-1">
            <div
              role="progressbar"
              aria-label={`Progress in ${course.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
            >
              <div className="h-full rounded-full bg-cyan-400" style={{ width: `${percent}%` }} />
            </div>
            <p className="font-mono text-xs text-slate-300">
              {done} of {total} lessons done
            </p>
          </div>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button size="sm" onClick={() => onOpen(course)} disabled={total === 0}>
            <PlayCircle aria-hidden="true" className="size-4" />
            {started ? 'Continue' : 'Start'}
            <span className="sr-only"> {course.title}</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            aria-pressed={enrolled}
            onClick={() => onToggleEnrolled(course, !enrolled)}
          >
            {enrolled ? 'Enrolled' : 'Enrol'}
            <span className="sr-only"> in {course.title} on this device</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
