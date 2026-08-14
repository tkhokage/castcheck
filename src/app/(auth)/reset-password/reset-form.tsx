"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type ResetState } from "@/app/actions/password";
import { Button, Field, inputClass } from "@/components/ui";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, undefined);

  if (state?.ok) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <p className="text-sm">Your password has been reset. You can sign in with your new password.</p>
        <Link href="/login" className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}
      <input type="hidden" name="token" value={token} />
      <Field label="New password" hint="At least 8 characters.">
        <input name="password" type="password" required autoComplete="new-password" className={inputClass} placeholder="••••••••" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Saving…" : "Set new password"}</Button>
    </form>
  );
}
