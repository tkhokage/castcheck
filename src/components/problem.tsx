import Link from "next/link";
import { ShieldCheck, ArrowRight, LifeBuoy } from "lucide-react";

// Shared branded content for error / 404 pages so a user never lands on a bare
// framework page. Pure (no hooks) so it works in server and client boundaries.
export function ProblemCard({
  code,
  title,
  message,
  reset,
}: {
  code?: string;
  title: string;
  message: string;
  reset?: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <Link href="/" className="mb-6 flex items-center gap-2 font-bold">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-fg">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="text-xl">CAST<span className="text-primary">CHECK</span></span>
      </Link>
      {code && <p className="font-mono text-sm font-semibold text-muted-2">{code}</p>}
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
          >
            Try again
          </button>
        )}
        <Link href="/discover" className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-semibold hover:bg-surface-2">
          Browse casting calls <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/support" className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-muted hover:text-foreground">
          <LifeBuoy className="h-4 w-4" /> Get support
        </Link>
      </div>
    </div>
  );
}
