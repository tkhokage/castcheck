"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSave, startApplication, submitReport } from "@/app/actions/opportunities";
import { Button, inputClass } from "./ui";
import { REPORT_REASONS } from "@/lib/constants";
import { Bookmark, BookmarkCheck, Flag, Plus, Check, X } from "lucide-react";

export function SaveButton({ id, saved: initial, signedIn }: { id: string; saved: boolean; signedIn: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!signedIn) return router.push("/login");
    start(async () => {
      const res = await toggleSave(id);
      if ("saved" in res) setSaved(!!res.saved);
    });
  }
  return (
    <Button variant="outline" onClick={onClick} disabled={pending}>
      {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}

export function TrackButton({ id, tracking, signedIn }: { id: string; tracking: boolean; signedIn: boolean }) {
  const [done, setDone] = useState(tracking);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!signedIn) return router.push("/login");
    start(async () => {
      await startApplication(id, "planning");
      setDone(true);
    });
  }
  return (
    <Button onClick={onClick} disabled={pending || done}>
      {done ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {done ? "In your tracker" : "Track this"}
    </Button>
  );
}

export function ReportDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function action(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await submitReport(undefined, formData);
      if (res?.error) setError(res.error);
      else setSubmitted(true);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-danger"
      >
        <Flag className="h-4 w-4" /> Report this opportunity
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Report opportunity"
            className="w-full max-w-md rounded-[var(--radius)] border border-border bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">Report opportunity</h3>
              <button onClick={() => setOpen(false)} aria-label="Close dialog" className="text-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="mt-4 rounded-lg bg-success-soft px-4 py-6 text-center text-sm text-success">
                <Check className="mx-auto mb-2 h-6 w-6" />
                Thank you. Your report became a trust & safety ticket our team will review.
              </div>
            ) : (
              <form action={action} className="mt-4 space-y-4">
                <input type="hidden" name="opportunityId" value={id} />
                {error && <p className="text-sm text-danger">{error}</p>}
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Reason</span>
                  <select name="reason" required className={inputClass} defaultValue="">
                    <option value="" disabled>Select a reason…</option>
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Details (optional)</span>
                  <textarea name="details" rows={3} className={inputClass} placeholder="What made this suspicious?" />
                </label>
                <Button type="submit" variant="danger" disabled={pending} className="w-full">
                  {pending ? "Submitting…" : "Submit report"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
