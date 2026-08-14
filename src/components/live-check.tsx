"use client";

import { useState, useTransition } from "react";
import { checkOpportunityWebsite, checkAgencyWebsite } from "@/app/actions/verify";
import type { WebVerifyResult } from "@/lib/verify-web";
import { Badge } from "./ui";
import { RadioTower, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const VERDICT = {
  pass: { tone: "success", label: "Checks out", Icon: CheckCircle2 },
  warn: { tone: "warning", label: "Needs a look", Icon: AlertTriangle },
  fail: { tone: "danger", label: "Failed", Icon: XCircle },
} as const;

const TONE_VAR: Record<string, string> = { success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)" };

export function LiveCheck({ opportunityId, agencyId }: { opportunityId?: string; agencyId?: string }) {
  const [result, setResult] = useState<WebVerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run() {
    setError(null);
    start(async () => {
      const res = agencyId
        ? await checkAgencyWebsite(agencyId)
        : await checkOpportunityWebsite(opportunityId!);
      if (res.error) setError(res.error);
      else if (res.result) setResult(res.result);
    });
  }

  const v = result ? VERDICT[result.verdict] : null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RadioTower className="h-4 w-4" />}
        {pending ? "Checking the website live…" : result ? "Re-run live check" : "Run a live website check"}
      </button>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {result && v && (
        <div className="mt-2 rounded-lg border border-border bg-surface-2 p-3 text-xs">
          <div className="flex items-center gap-2">
            <v.Icon className="h-4 w-4" style={{ color: TONE_VAR[v.tone] }} />
            <span className="font-semibold">Live check: </span>
            <Badge tone={v.tone}>{v.label}</Badge>
          </div>
          <ul className="mt-2 space-y-1 text-muted">
            {result.notes.map((n, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 text-muted-2">•</span> {n}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-muted-2">
            Checked just now, live from CASTCHECK&rsquo;s server. This confirms the link resolves — it does not by
            itself prove the organization is legitimate.
          </p>
        </div>
      )}
    </div>
  );
}
