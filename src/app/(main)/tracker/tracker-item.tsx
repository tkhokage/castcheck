"use client";

import { useTransition } from "react";
import Link from "next/link";
import { updateApplication, removeApplication } from "@/app/actions/opportunities";
import { Card, Badge, inputClass } from "@/components/ui";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Trash2, ExternalLink } from "lucide-react";

const STATUS_TONE: Record<string, string> = {
  saved: "neutral", planning: "neutral", applied: "info", submitted: "info",
  audition_scheduled: "primary", callback: "primary", offer: "success", booked: "success",
  rejected: "danger", withdrawn: "neutral", expired: "neutral",
};

export interface AppItem {
  id: string;
  status: string;
  notes: string | null;
  deadline: string | null;
  auditionDate: string | null;
  followUpDate: string | null;
  opportunity: { id: string; title: string; production: string | null; location: string; type: string };
}

export function TrackerItem({ app }: { app: AppItem }) {
  const [pending, start] = useTransition();

  function changeStatus(status: string) {
    const fd = new FormData();
    fd.set("id", app.id);
    fd.set("status", status);
    start(() => void updateApplication(undefined, fd));
  }
  function saveNotes(notes: string) {
    const fd = new FormData();
    fd.set("id", app.id);
    fd.set("notes", notes);
    start(() => void updateApplication(undefined, fd));
  }

  return (
    <Card className={`p-4 ${pending ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/opportunities/${app.opportunity.id}`} className="font-semibold hover:text-primary inline-flex items-center gap-1">
            {app.opportunity.title} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </Link>
          <p className="mt-0.5 text-sm text-muted">
            {app.opportunity.type} · {app.opportunity.location}
            {app.opportunity.production ? ` · ${app.opportunity.production}` : ""}
          </p>
        </div>
        <Badge tone={STATUS_TONE[app.status] ?? "neutral"}>{APPLICATION_STATUS_LABELS[app.status] ?? app.status}</Badge>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Status</span>
          <select value={app.status} onChange={(e) => changeStatus(e.target.value)} className={inputClass}>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Info label="Deadline" value={formatDate(app.deadline)} />
          <Info label="Audition" value={formatDate(app.auditionDate)} />
          <Info label="Follow-up" value={formatDate(app.followUpDate)} />
        </div>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-medium text-muted">Notes</span>
        <textarea
          defaultValue={app.notes ?? ""}
          onBlur={(e) => e.target.value !== (app.notes ?? "") && saveNotes(e.target.value)}
          rows={2}
          placeholder="Materials sent, contacts, next steps…"
          className={inputClass}
        />
      </label>

      <div className="mt-2 flex justify-end">
        <button
          onClick={() => start(() => void removeApplication(app.id))}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-2 py-1.5">
      <div className="text-muted-2">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
