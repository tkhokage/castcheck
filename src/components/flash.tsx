import { CheckCircle2 } from "lucide-react";

// Simple success confirmation banner shown after a redirect (e.g. ?posted=1).
export function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-2 rounded-[var(--radius)] border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
