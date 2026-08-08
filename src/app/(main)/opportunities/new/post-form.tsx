"use client";

import { useActionState } from "react";
import { createOpportunity } from "@/app/actions/create-opportunity";
import { Button, Card, Field, inputClass } from "@/components/ui";
import {
  OPPORTUNITY_TYPES, ROLE_TYPES, LOCATIONS, COMPENSATION, PRODUCTION_TYPES, EXPERIENCE_LEVELS,
} from "@/lib/constants";
import { AlertCircle } from "lucide-react";

function Select({ name, options, required }: { name: string; options: readonly string[]; required?: boolean }) {
  return (
    <select name={name} required={required} className={inputClass} defaultValue="">
      <option value="" disabled={required}>Select…</option>
      {options.map((o) => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
    </select>
  );
}

export function PostForm() {
  const [state, action, pending] = useActionState(createOpportunity, undefined);

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">The role</h2>
        <div className="space-y-4">
          <Field label="Title"><input name="title" required className={inputClass} placeholder="Supporting Role — Indie Feature 'Cicada Summer'" /></Field>
          <Field label="Role"><input name="role" required className={inputClass} placeholder="Danny — supporting" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type"><Select name="type" options={OPPORTUNITY_TYPES} required /></Field>
            <Field label="Role type"><Select name="roleType" options={ROLE_TYPES} required /></Field>
            <Field label="Location"><Select name="location" options={LOCATIONS} required /></Field>
            <Field label="Experience level"><Select name="experienceLevel" options={EXPERIENCE_LEVELS} /></Field>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Production</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Production"><input name="production" className={inputClass} /></Field>
          <Field label="Production company"><input name="productionCompany" className={inputClass} /></Field>
          <Field label="Casting entity"><input name="castingEntity" className={inputClass} /></Field>
          <Field label="Production type"><Select name="productionType" options={PRODUCTION_TYPES} /></Field>
          <Field label="Union status"><input name="unionStatus" className={inputClass} placeholder="SAG-AFTRA / Non-union" /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Compensation & submission</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Compensation"><Select name="compensation" options={COMPENSATION} required /></Field>
          <Field label="Pay details"><input name="payDetails" className={inputClass} placeholder="$750/day, 6 shoot days" /></Field>
          <Field label="Submission method"><input name="submissionMethod" className={inputClass} placeholder="Self-tape via casting portal" /></Field>
          <Field label="Contact email"><input name="contactEmail" type="email" className={inputClass} /></Field>
          <Field label="Deadline"><input name="deadline" type="date" className={inputClass} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Description"><textarea name="description" rows={4} className={inputClass} placeholder="Describe the project, role, and process." /></Field>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit for verification"}</Button>
        <p className="text-xs text-muted">Submissions are auto-screened and reviewed by a moderator before they&rsquo;re marked verified.</p>
      </div>
    </form>
  );
}
