// Loading skeletons so navigation to data-backed pages never shows a blank screen.

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-2 ${className}`} />;
}

export function CardGridSkeleton({ count = 6, title = "Loading…" }: { count?: number; title?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Bar className="h-8 w-48" />
      <Bar className="mt-3 h-4 w-72" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius)] border border-border bg-surface p-5">
            <Bar className="h-4 w-24" />
            <Bar className="mt-3 h-5 w-full" />
            <Bar className="mt-2 h-4 w-3/4" />
            <div className="mt-4 flex gap-2">
              <Bar className="h-6 w-20" />
              <Bar className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export function RowsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Bar className="h-8 w-56" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius)] border border-border bg-surface p-4">
            <Bar className="h-5 w-2/3" />
            <Bar className="mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
