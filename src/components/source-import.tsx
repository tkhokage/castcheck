"use client";
import { useActionState, useState } from "react";
import { previewListingSource } from "@/app/actions/source-preview";
import { ImportForm } from "@/app/(main)/find/import/import-form";
import { Button, Card, inputClass } from "./ui";

export function SourceImport() {
  const [resetKey, setResetKey] = useState(0);
  return <SourceImportForm key={resetKey} reset={() => setResetKey(value => value + 1)} />;
}

function SourceImportForm({ reset }: { reset: () => void }) {
  const [state, action, pending] = useActionState(previewListingSource, undefined);
  return <div className="space-y-6">
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Start with the source</h2>
      <p className="mt-2 text-sm text-muted">Read a public listing, then review the details before saving. For pages behind sign-in, use the manual form below.</p>
      <form action={action} className="mt-4 space-y-3">
        <label className="block text-sm font-medium">Public listing URL<input name="sourceUrl" type="url" required maxLength={2000} placeholder="https://" className={`${inputClass} mt-1`} /></label>
        <Button disabled={pending}>{pending ? "Reading source…" : "Read source page"}</Button>
      </form>
      {state?.error && <p role="alert" className="mt-3 text-sm text-danger">{state.error}</p>}
      {state?.preview && <div role="status" className="mt-4 rounded-lg bg-primary-soft p-4 text-sm"><p className="font-semibold">Source read. Review the form below.</p><p className="mt-1">{state.preview.extraction === "structured" ? "Fields came from the page’s structured listing data." : "Only page metadata was available; it may not describe a specific casting call."} This does not verify the opportunity.</p><p className="mt-2 text-muted">Retrieved {new Date(state.preview.fetchedAt).toLocaleString()}. No pay, location or eligibility has been inferred.</p></div>}
    </Card>
    {state?.preview && <button type="button" onClick={reset} className="text-sm font-semibold text-primary underline">Clear source and enter manually</button>}
    <Card className="p-6"><ImportForm key={state?.receipt || "manual"} preview={state?.preview} receipt={state?.receipt} /></Card>
  </div>;
}
