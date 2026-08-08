"use client";

import { useActionState } from "react";
import { updateTicket } from "@/app/actions/support";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { TICKET_STATUSES, TICKET_PRIORITIES } from "@/lib/constants";
import { Check } from "lucide-react";

export function StaffPanel({ ticket }: { ticket: { id: string; status: string; priority: string; resolution: string | null; internalNotes: string | null } }) {
  const [state, action, pending] = useActionState(updateTicket, undefined);

  return (
    <Card className="border-primary/30 p-5">
      <h2 className="font-semibold">Analyst tools</h2>
      <p className="mb-4 text-sm text-muted">Staff-only. Changes are audit-logged.</p>
      {state?.ok && <div className="mb-3 flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm text-success"><Check className="h-4 w-4" /> Ticket updated.</div>}
      {state?.error && <p className="mb-3 text-sm text-danger">{state.error}</p>}
      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={ticket.id} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select name="status" defaultValue={ticket.status} className={inputClass}>
              {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select name="priority" defaultValue={ticket.priority} className={inputClass}>
              {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Internal notes">
          <textarea name="internalNotes" rows={2} defaultValue={ticket.internalNotes ?? ""} className={inputClass} />
        </Field>
        <Field label="Resolution">
          <textarea name="resolution" rows={2} defaultValue={ticket.resolution ?? ""} className={inputClass} placeholder="How was this resolved?" />
        </Field>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Update ticket"}</Button>
      </form>
    </Card>
  );
}
