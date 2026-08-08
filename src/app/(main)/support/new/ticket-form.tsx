"use client";

import { useActionState } from "react";
import { createTicket } from "@/app/actions/support";
import { Button, Field, inputClass } from "@/components/ui";
import { TICKET_CATEGORIES } from "@/lib/constants";
import { AlertCircle } from "lucide-react";

export function TicketForm() {
  const [state, action, pending] = useActionState(createTicket, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}
      <Field label="Subject">
        <input name="subject" required className={inputClass} placeholder="Short summary of the issue" />
      </Field>
      <Field label="Category">
        <select name="category" required className={inputClass} defaultValue="">
          <option value="" disabled>Select a category…</option>
          {TICKET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Description" hint="We auto-triage priority when you submit.">
        <textarea name="description" required rows={5} className={inputClass} placeholder="What happened? Include steps, browser, and any error messages." />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit ticket"}</Button>
    </form>
  );
}
