'use client';

// Replaces the root layout when it fails, so it brings its own html/body and minimal inline styles.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-GB">
      <body
        style={{
          background: '#07090e',
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
          padding: '4rem 1.5rem',
        }}
      >
        <main>
          <h1>Something went wrong</h1>
          <p>
            The site could not be shown. You can try again, or email admin@ikcloudsolutions.com.
          </p>
          {error.digest ? <p>Reference: {error.digest}</p> : null}
          <button
            type="button"
            onClick={reset}
            style={{ minHeight: '44px', padding: '0 1.25rem', fontSize: '1rem' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
