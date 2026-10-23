'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { CATEGORIES, LEVELS, type Category, type Level } from '@/content/academy/courses';
import {
  splitLines,
  validateCourseForm,
  validateLessonForm,
  type CourseFormValues,
  type FormErrors,
  type LessonFormValues,
} from '@/lib/academy/studio-forms';

interface CourseFormProps {
  initial: CourseFormValues;
  submitLabel: string;
  onSubmit: (values: CourseFormValues) => void;
  onCancel: () => void;
}

export function CourseForm({ initial, submitLabel, onSubmit, onCancel }: CourseFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateCourseForm(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormField label="Course title" required error={errors.title}>
        {(control) => (
          <Input
            {...control}
            value={values.title}
            maxLength={160}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
          />
        )}
      </FormField>
      <FormField label="Subtitle" error={errors.subtitle}>
        {(control) => (
          <Input
            {...control}
            value={values.subtitle}
            onChange={(event) => setValues({ ...values, subtitle: event.target.value })}
          />
        )}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category">
          {(control) => (
            <Select
              {...control}
              value={values.category}
              onChange={(event) =>
                setValues({ ...values, category: event.target.value as Category })
              }
            >
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label="Level">
          {(control) => (
            <Select
              {...control}
              value={values.level}
              onChange={(event) => setValues({ ...values, level: event.target.value as Level })}
            >
              {LEVELS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          )}
        </FormField>
      </div>
      <FormField label="Skills" hint="Separate with commas. Up to 8." error={errors.skills}>
        {(control) => (
          <Input
            {...control}
            value={values.skills}
            onChange={(event) => setValues({ ...values, skills: event.target.value })}
          />
        )}
      </FormField>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface LessonFormProps {
  initial: LessonFormValues;
  submitLabel: string;
  onSubmit: (values: LessonFormValues) => void;
  onCancel: () => void;
}

export function LessonForm({ initial, submitLabel, onSubmit, onCancel }: LessonFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const optionCount = Math.max(splitLines(values.quizOptions).length, 2);

  function set<K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateLessonForm(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormField label="Lesson title" required error={errors.title}>
        {(control) => (
          <Input
            {...control}
            value={values.title}
            maxLength={160}
            onChange={(event) => set('title', event.target.value)}
          />
        )}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <FormField label="Planned minutes" required error={errors.minutes}>
          {(control) => (
            <Input
              {...control}
              inputMode="numeric"
              value={values.minutes}
              onChange={(event) => set('minutes', event.target.value)}
            />
          )}
        </FormField>
        <FormField
          label="Video address"
          required
          hint="A sample video is filled in. Use any video file address you are allowed to use."
          error={errors.videoUrl}
        >
          {(control) => (
            <Input
              {...control}
              type="url"
              value={values.videoUrl}
              onChange={(event) => set('videoUrl', event.target.value)}
            />
          )}
        </FormField>
      </div>
      <FormField label="Summary" error={errors.summary}>
        {(control) => (
          <Textarea
            {...control}
            className="min-h-20"
            value={values.summary}
            onChange={(event) => set('summary', event.target.value)}
          />
        )}
      </FormField>
      <FormField
        label="Notes"
        hint="Plain text. Leave a blank line between paragraphs."
        error={errors.notes}
      >
        {(control) => (
          <Textarea
            {...control}
            value={values.notes}
            onChange={(event) => set('notes', event.target.value)}
          />
        )}
      </FormField>
      <FormField label="Terminal command" error={errors.terminalCommand}>
        {(control) => (
          <Input
            {...control}
            value={values.terminalCommand}
            onChange={(event) => set('terminalCommand', event.target.value)}
          />
        )}
      </FormField>
      <FormField
        label="Illustrative terminal output"
        hint="Write an example. It is shown labelled as illustrative output."
        error={errors.terminalOutput}
      >
        {(control) => (
          <Textarea
            {...control}
            className="min-h-20 font-mono"
            value={values.terminalOutput}
            onChange={(event) => set('terminalOutput', event.target.value)}
          />
        )}
      </FormField>
      <FormField label="Quiz question" required error={errors.quizQuestion}>
        {(control) => (
          <Input
            {...control}
            value={values.quizQuestion}
            onChange={(event) => set('quizQuestion', event.target.value)}
          />
        )}
      </FormField>
      <FormField
        label="Answer options"
        required
        hint="One option per line, 2 to 6 options."
        error={errors.quizOptions}
      >
        {(control) => (
          <Textarea
            {...control}
            className="min-h-24"
            value={values.quizOptions}
            onChange={(event) => set('quizOptions', event.target.value)}
          />
        )}
      </FormField>
      <FormField label="Correct option" required error={errors.quizCorrect}>
        {(control) => (
          <Select
            {...control}
            value={values.quizCorrect}
            onChange={(event) => set('quizCorrect', event.target.value)}
          >
            {Array.from({ length: optionCount }, (_, index) => (
              <option key={index} value={String(index + 1)}>
                Option {index + 1}
              </option>
            ))}
          </Select>
        )}
      </FormField>
      <FormField label="Answer explanation">
        {(control) => (
          <Input
            {...control}
            value={values.quizExplanation}
            onChange={(event) => set('quizExplanation', event.target.value)}
          />
        )}
      </FormField>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
