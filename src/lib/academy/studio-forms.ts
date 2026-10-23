import {
  CATEGORIES,
  DEFAULT_SAMPLE_VIDEO,
  LEVELS,
  type Category,
  type Course,
  type Lesson,
  type Level,
  type ThumbnailIcon,
  type ThumbnailGradient,
} from '@/content/academy/courses';

// Pure helpers behind the demo course editor: form values, validation and building the objects
// that are saved to the browser. Kept apart from the component so they can be unit tested.

export interface CourseFormValues {
  title: string;
  subtitle: string;
  category: Category;
  level: Level;
  /** Comma separated. */
  skills: string;
}

export interface LessonFormValues {
  title: string;
  minutes: string;
  videoUrl: string;
  summary: string;
  notes: string;
  terminalCommand: string;
  terminalOutput: string;
  quizQuestion: string;
  /** One option per line. */
  quizOptions: string;
  /** 1-based position of the correct option. */
  quizCorrect: string;
  quizExplanation: string;
}

export type FormErrors = Partial<Record<string, string>>;

export const emptyCourseForm = (): CourseFormValues => ({
  title: '',
  subtitle: '',
  category: CATEGORIES[0],
  level: LEVELS[0],
  skills: '',
});

export const emptyLessonForm = (): LessonFormValues => ({
  title: '',
  minutes: '10',
  videoUrl: DEFAULT_SAMPLE_VIDEO,
  summary: '',
  notes: '',
  terminalCommand: '',
  terminalOutput: '',
  quizQuestion: '',
  quizOptions: '',
  quizCorrect: '1',
  quizExplanation: '',
});

const categoryThumbnails: Record<Category, { icon: ThumbnailIcon; gradient: ThumbnailGradient }> = {
  'Kubernetes and containers': { icon: 'boxes', gradient: 'cyan' },
  'AWS and multi-cloud': { icon: 'cloud', gradient: 'violet' },
  'Terraform and IaC': { icon: 'layers', gradient: 'emerald' },
  'DevSecOps and security': { icon: 'shield-check', gradient: 'amber' },
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

export function validateCourseForm(values: CourseFormValues): FormErrors {
  const errors: FormErrors = {};
  const title = values.title.trim();
  if (title === '') errors.title = 'Enter a course title.';
  else if (title.length > 160) errors.title = 'Use 160 characters or fewer.';
  if (values.subtitle.trim().length > 300) errors.subtitle = 'Use 300 characters or fewer.';
  const skills = values.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
  if (skills.length > 8) errors.skills = 'List up to 8 skills.';
  else if (skills.some((skill) => skill.length > 40)) {
    errors.skills = 'Keep each skill to 40 characters or fewer.';
  }
  return errors;
}

export function validateLessonForm(values: LessonFormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.title.trim() === '') errors.title = 'Enter a lesson title.';
  else if (values.title.trim().length > 160) errors.title = 'Use 160 characters or fewer.';

  const minutes = Number(values.minutes);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) {
    errors.minutes = 'Enter a whole number of minutes from 1 to 600.';
  }
  if (!isHttpUrl(values.videoUrl.trim())) {
    errors.videoUrl = 'Enter a web address starting with http:// or https://.';
  }
  if (values.summary.trim().length > 600) errors.summary = 'Use 600 characters or fewer.';
  if (values.notes.trim().length > 4000) errors.notes = 'Use 4,000 characters or fewer.';
  if (values.terminalCommand.trim().length > 300) {
    errors.terminalCommand = 'Use 300 characters or fewer.';
  }
  if (values.terminalOutput.trim().length > 3000) {
    errors.terminalOutput = 'Use 3,000 characters or fewer.';
  }

  if (values.quizQuestion.trim() === '') errors.quizQuestion = 'Enter a quiz question.';
  const options = splitLines(values.quizOptions);
  if (options.length < 2 || options.length > 6) {
    errors.quizOptions = 'Enter between 2 and 6 answer options, one per line.';
  } else if (options.some((option) => option.length > 200)) {
    errors.quizOptions = 'Keep each option to 200 characters or fewer.';
  }
  const correct = Number(values.quizCorrect);
  if (!Number.isInteger(correct) || correct < 1 || correct > Math.max(options.length, 1)) {
    errors.quizCorrect = 'Choose the number of the correct option.';
  }
  return errors;
}

/** A short random suffix is enough here: ids only need to be unique inside one browser. */
function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildCourse(values: CourseFormValues, existing?: Course): Course {
  const thumbnail = categoryThumbnails[values.category];
  return {
    id: existing?.id ?? newId('custom'),
    title: values.title.trim(),
    subtitle: values.subtitle.trim(),
    category: values.category,
    level: values.level,
    skills: values.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean),
    thumbnail,
    modules: existing?.modules ?? [],
    custom: true,
  };
}

export function buildLesson(values: LessonFormValues, id?: string): Lesson {
  return {
    id: id ?? newId('lesson'),
    title: values.title.trim(),
    durationSeconds: Number(values.minutes) * 60,
    videoUrl: values.videoUrl.trim(),
    summary: values.summary.trim(),
    notes: values.notes.trim(),
    terminalCommand: values.terminalCommand.trim(),
    terminalOutput: values.terminalOutput.trim(),
    quiz: {
      question: values.quizQuestion.trim(),
      options: splitLines(values.quizOptions),
      correctIndex: Number(values.quizCorrect) - 1,
      explanation: values.quizExplanation.trim(),
    },
    resources: [],
  };
}

export function courseToForm(course: Course): CourseFormValues {
  return {
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    level: course.level,
    skills: course.skills.join(', '),
  };
}

export function lessonToForm(lesson: Lesson): LessonFormValues {
  return {
    title: lesson.title,
    minutes: String(Math.max(1, Math.round(lesson.durationSeconds / 60))),
    videoUrl: lesson.videoUrl,
    summary: lesson.summary,
    notes: lesson.notes,
    terminalCommand: lesson.terminalCommand,
    terminalOutput: lesson.terminalOutput,
    quizQuestion: lesson.quiz.question,
    quizOptions: lesson.quiz.options.join('\n'),
    quizCorrect: String(lesson.quiz.correctIndex + 1),
    quizExplanation: lesson.quiz.explanation,
  };
}

const EDITOR_MODULE_ID = 'lessons';

/** Custom courses keep all their lessons in one module. */
export function withLesson(course: Course, lesson: Lesson): Course {
  const [first, ...rest] = course.modules;
  if (!first) {
    return {
      ...course,
      modules: [{ id: EDITOR_MODULE_ID, title: 'Lessons', lessons: [lesson] }],
    };
  }
  const exists = first.lessons.some((item) => item.id === lesson.id);
  const lessons = exists
    ? first.lessons.map((item) => (item.id === lesson.id ? lesson : item))
    : [...first.lessons, lesson];
  return { ...course, modules: [{ ...first, lessons }, ...rest] };
}

export function withoutLesson(course: Course, lessonId: string): Course {
  return {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
    })),
  };
}
