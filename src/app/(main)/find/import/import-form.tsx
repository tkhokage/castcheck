"use client";

import { useActionState } from "react";
import { importListing } from "@/app/actions/import";
import { Button, Field, inputClass } from "@/components/ui";
import { OPPORTUNITY_TYPES, LOCATIONS, COMPENSATION } from "@/lib/constants";
import { AlertCircle } from "lucide-react";

const PLATFORMS = ["Actors Access", "Casting Networks", "Backstage", "IMDbPro", "Other"];

function Select({ name, options, blank }: { name: string; options: readonly string[]; blank: string }) {
  return (
    <select name={name} className={inputClass} defaultValue="">
      <option value="">{blank}</option>
      {options.map((o) => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
    </select>
  );
}

export function ImportForm() {
  const [state, action, pending] = useActionState(importListing, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <Field label="Role / title" hint="Copy it from the listing.">
        <input name="title" required className={inputClass} placeholder="e.g. Supporting — Indie Feature" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Where you found it">
          <select name="platform" className={inputClass} defaultValue="">
            <option value="">Select…</option>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Link to the listing (optional)" hint="Enables the live website check.">
          <input name="url" className={inputClass} placeholder="https://…" />
        </Field>
        <Field label="Type"><Select name="type" options={OPPORTUNITY_TYPES} blank="Any" /></Field>
        <Field label="Location"><Select name="location" options={LOCATIONS} blank="Unknown" /></Field>
        <Field label="Compensation"><Select name="compensation" options={COMPENSATION} blank="Unknown" /></Field>
        <Field label="Role detail (optional)"><input name="role" className={inputClass} placeholder="Lead, supporting…" /></Field>
      </div>

      <Field label="Paste the listing text (optional)" hint="We scan it for scam patterns (fees, gift cards, off-platform contact, etc.).">
        <textarea name="description" rows={6} className={inputClass} placeholder="Paste the casting notice here…" />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Importing & checking…" : "Import & verify"}</Button>
        <p className="text-xs text-muted">
          Imported listings are <strong>private to you</strong>, screened for risk, and added to your tracker.
        </p>
      </div>
    </form>
  );
}
