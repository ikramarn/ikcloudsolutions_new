'use client';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="py-24">
      <Container>
        <h1 className="text-4xl font-extrabold text-white">Something went wrong</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-300">
          This page could not be shown. You can try again, or email us if it keeps happening.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-sm text-slate-300">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="secondary">
            Go to the home page
          </Button>
        </div>
      </Container>
    </section>
  );
}
