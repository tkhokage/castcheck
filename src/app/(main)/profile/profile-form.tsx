"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/actions/profile";
import { Button, Card, Field, inputClass } from "@/components/ui";
import {
  OPPORTUNITY_TYPES, LOCATIONS, ROLE_TYPES, EXPERIENCE_LEVELS, PRODUCTION_TYPES, COMPENSATION,
} from "@/lib/constants";
import { asList } from "@/lib/utils";
import { Check } from "lucide-react";

type ProfileData = Record<string, unknown> | null;

function CheckGroup({ name, options, selected }: { name: string; options: readonly string[]; selected: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-strong px-3 py-1 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary">
          <input type="checkbox" name={name} value={o} defaultChecked={selected.includes(o)} className="sr-only" />
          {o[0].toUpperCase() + o.slice(1)}
        </label>
      ))}
    </div>
  );
}

export function ProfileForm({ profile, email }: { profile: ProfileData; email: string }) {
  const [state, action, pending] = useActionState(saveProfile, undefined);
  const p = profile ?? {};
  const val = (k: string) => (p[k] as string) ?? "";
  const list = (k: string) => asList(p[k]).map(String);

  return (
    <form action={action} className="space-y-6">
      {state?.ok && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-sm text-success">
          <Check className="h-4 w-4" /> Profile saved.
        </div>
      )}
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name"><input name="displayName" defaultValue={val("displayName")} className={inputClass} /></Field>
          <Field label="Location"><input name="location" defaultValue={val("location")} className={inputClass} placeholder="Dallas, TX" /></Field>
          <Field label="Professional email" hint="Use a dedicated acting email."><input name="professionalEmail" defaultValue={val("professionalEmail")} className={inputClass} placeholder={email} /></Field>
          <Field label="Professional phone"><input name="professionalPhone" defaultValue={val("professionalPhone")} className={inputClass} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Bio"><textarea name="bio" rows={3} defaultValue={val("bio")} className={inputClass} /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Skills & training</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Skills" hint="Comma-separated"><input name="skills" defaultValue={list("skills").join(", ")} className={inputClass} placeholder="Improv, Stage combat" /></Field>
          <Field label="Special skills" hint="Comma-separated"><input name="specialSkills" defaultValue={list("specialSkills").join(", ")} className={inputClass} placeholder="Valid passport, Driver's license" /></Field>
          <Field label="Training" hint="Comma-separated"><input name="training" defaultValue={list("training").join(", ")} className={inputClass} /></Field>
          <Field label="Languages" hint="Comma-separated"><input name="languages" defaultValue={list("languages").join(", ")} className={inputClass} /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 font-semibold">Career goals</h2>
        <p className="mb-4 text-sm text-muted">These power your career-fit scores and agency matches.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Experience level">
            <select name="experienceLevel" defaultValue={val("experienceLevel")} className={inputClass}>
              <option value="">Select…</option>
              {EXPERIENCE_LEVELS.map((e) => <option key={e} value={e}>{e[0].toUpperCase() + e.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Compensation preference">
            <select name="compensationPref" defaultValue={val("compensationPref")} className={inputClass}>
              <option value="">Any</option>
              {COMPENSATION.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field label="Preferred mediums"><CheckGroup name="preferredMediums" options={OPPORTUNITY_TYPES} selected={list("preferredMediums")} /></Field>
          <Field label="Desired markets"><CheckGroup name="desiredMarkets" options={LOCATIONS} selected={list("desiredMarkets")} /></Field>
          <Field label="Role types"><CheckGroup name="roleTypes" options={ROLE_TYPES} selected={list("roleTypes")} /></Field>
          <Field label="Production types"><CheckGroup name="productionTypePref" options={PRODUCTION_TYPES} selected={list("productionTypePref")} /></Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Career goals"><textarea name="careerGoals" rows={2} defaultValue={val("careerGoals")} className={inputClass} /></Field>
          <Field label="Representation goals"><textarea name="representationGoals" rows={2} defaultValue={val("representationGoals")} className={inputClass} /></Field>
          <Field label="Availability"><input name="availability" defaultValue={val("availability")} className={inputClass} /></Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" name="willingToTravel" defaultChecked={!!p.willingToTravel} className="h-4 w-4 rounded border-border-strong" />
            Willing to travel for work
          </label>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
        <p className="text-xs text-muted">CASTCHECK never collects SSN, government ID, or banking information.</p>
      </div>
    </form>
  );
}
