import { z } from 'zod';
import {
  CATEGORIES,
  LEVELS,
  THUMBNAIL_GRADIENTS,
  THUMBNAIL_ICONS,
  type Course,
} from '@/content/academy/courses';

// Stored data is untrusted (anyone can edit localStorage), so it is parsed with limits before use.
const httpUrl = z
  .string()
  .max(500)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, 'Enter a web address starting with http:// or https://');

const quizSchema = z.object({
  question: z.string().min(1).max(300),
  options: z.array(z.string().min(1).max(200)).min(2).max(6),
  correctIndex: z.number().int().min(0).max(5),
  explanation: z.string().max(500),
});

const lessonSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  durationSeconds: z.number().int().min(0).max(36000),
  videoUrl: httpUrl,
  summary: z.string().max(600),
  notes: z.string().max(4000),
  terminalCommand: z.string().max(300),
  terminalOutput: z.string().max(3000),
  quiz: quizSchema,
  resources: z.array(z.object({ label: z.string().max(160), href: httpUrl })).max(10),
});

export const courseSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  subtitle: z.string().max(300),
  category: z.enum(CATEGORIES),
  level: z.enum(LEVELS),
  skills: z.array(z.string().min(1).max(40)).max(8),
  thumbnail: z.object({
    gradient: z.enum(THUMBNAIL_GRADIENTS),
    icon: z.enum(THUMBNAIL_ICONS),
  }),
  modules: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(160),
        lessons: z.array(lessonSchema).max(40),
      }),
    )
    .max(10),
  custom: z.boolean().optional(),
});

export const MAX_CUSTOM_COURSES = 20;

const progressSchema = z.object({
  enrolled: z.array(z.string().max(80)).max(100),
  completed: z.record(z.string().max(80), z.array(z.string().max(80)).max(400)),
  quiz: z.record(z.string().max(200), z.boolean()),
});
export type Progress = z.infer<typeof progressSchema>;

export const emptyProgress = (): Progress => ({ enrolled: [], completed: {}, quiz: {} });

function parseJson(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function parseProgress(raw: string | null): Progress {
  const result = progressSchema.safeParse(parseJson(raw));
  return result.success ? result.data : emptyProgress();
}

/** Keeps the courses that are valid and drops the rest, so one bad entry cannot hide the others. */
export function parseCustomCourses(raw: string | null): Course[] {
  const data = parseJson(raw);
  if (!Array.isArray(data)) return [];
  const courses: Course[] = [];
  for (const entry of data.slice(0, MAX_CUSTOM_COURSES)) {
    const result = courseSchema.safeParse(entry);
    if (result.success) courses.push({ ...result.data, custom: true });
  }
  return courses;
}
