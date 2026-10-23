'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RadioGroup } from '@/components/ui/FormControls';
import type { Quiz } from '@/content/academy/courses';

interface QuizPanelProps {
  quiz: Quiz;
  /** The saved result from an earlier attempt on this device, if any. */
  savedResult: boolean | undefined;
  /** Called only after the learner presses "Check answer". */
  onAnswer: (correct: boolean) => void;
}

export function QuizPanel({ quiz, savedResult, onAnswer }: QuizPanelProps) {
  const name = useId();
  const [selected, setSelected] = useState<string>('');
  const [result, setResult] = useState<boolean | null>(null);

  function check() {
    if (selected === '') return;
    const correct = Number(selected) === quiz.correctIndex;
    setResult(correct);
    onAnswer(correct);
  }

  function tryAgain() {
    setSelected('');
    setResult(null);
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        name={name}
        legend={quiz.question}
        options={quiz.options.map((option, index) => ({ value: String(index), label: option }))}
        value={selected}
        onChange={result === null ? setSelected : () => {}}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={check} disabled={selected === '' || result !== null}>
          Check answer
        </Button>
        {result !== null ? (
          <Button size="sm" variant="secondary" onClick={tryAgain}>
            Try again
          </Button>
        ) : null}
      </div>
      <div role="status" aria-live="polite" className="text-sm">
        {result === null ? null : (
          <p className={result ? 'text-emerald-300' : 'text-amber-200'}>
            {result ? 'Correct. ' : 'Not quite. '}
            {quiz.explanation}
          </p>
        )}
        {result === null && savedResult !== undefined ? (
          <p className="text-slate-300">
            Your last saved answer on this device was {savedResult ? 'correct' : 'not correct'}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
