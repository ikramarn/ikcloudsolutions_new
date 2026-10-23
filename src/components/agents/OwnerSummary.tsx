/** "What the owner receives": a structured example, clearly marked as an example. */
export function OwnerSummary({ summary }: { summary: string }) {
  const rows = summary.split('\n').map((line) => {
    const split = line.indexOf(':');
    return split === -1
      ? { label: '', value: line }
      : { label: line.slice(0, split), value: line.slice(split + 1).trim() };
  });
  return (
    <section
      aria-label="What the owner receives (example)"
      className="rounded-xl border border-white/15 bg-surface p-4"
    >
      <h4 className="text-sm font-bold text-white">What the owner receives (example)</h4>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map((row, index) => (
          <div key={index}>
            {row.label ? <dt className="font-semibold text-slate-200">{row.label}</dt> : null}
            <dd className="text-slate-300">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
