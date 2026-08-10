"use client";

import { useActionState } from "react";
import { analyzeContractAction } from "@/app/actions/contracts";
import { Button, Field, inputClass } from "@/components/ui";
import { AlertCircle, ShieldCheck } from "lucide-react";

const SAMPLE = `This Talent Representation Agreement is entered into between the Agency and the Artist.
The Agency shall be the sole and exclusive representative of the Artist for film, television, and commercial engagements throughout the world.
The term of this agreement is three (3) years and shall automatically renew for successive one (1) year terms unless either party gives 30 days written notice.
The Agency's commission shall be twenty percent (20%) of the Artist's gross compensation.
The Company may create and use a digital replica of the Artist, including artificial intelligence to synthesize the Artist's voice and likeness, in all media now known or hereafter devised, in perpetuity.
Commissions shall continue after the termination of this agreement on all engagements booked during the term.`;

export function ContractForm() {
  const [state, action, pending] = useActionState(analyzeContractAction, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label (optional)" hint="Just for your records.">
          <input name="title" className={inputClass} placeholder="e.g. Starlight Agency contract" />
        </Field>
        <Field label="Type">
          <select name="source" className={inputClass} defaultValue="agency">
            <option value="agency">Talent agency / management</option>
            <option value="production">Production / project</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Paste the contract text">
        <textarea
          name="text"
          rows={12}
          required
          className={`${inputClass} font-mono text-xs leading-relaxed`}
          placeholder="Paste the full agreement text here…"
        />
      </Field>

      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary-soft/40 px-3 py-2 text-xs text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          Your privacy: CASTCHECK saves only the <strong>findings</strong> (which clauses were detected and short
          excerpts) — never the full contract text. Contracts are sensitive; we keep as little as possible.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Analyzing…" : "Analyze contract"}</Button>
        <button
          type="button"
          onClick={(e) => {
            const ta = e.currentTarget.closest("form")?.querySelector<HTMLTextAreaElement>('textarea[name="text"]');
            if (ta) ta.value = SAMPLE;
          }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try a sample contract
        </button>
      </div>
    </form>
  );
}
