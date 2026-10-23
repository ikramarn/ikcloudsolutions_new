/** The first focusable element on every page. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-cyan-brand focus:px-4 focus:py-3 focus:font-semibold focus:text-slate-950"
    >
      Skip to main content
    </a>
  );
}
