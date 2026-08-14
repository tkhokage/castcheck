"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "@/app/actions/password";
import { Button, Field, inputClass } from "@/components/ui";
import { AlertCircle, MailCheck } from "lucide-react";

export function ForgotForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(requestPasswordReset, undefined);

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success-soft px-3 py-3 text-sm text-success">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>If an account exists for that email, we&rsquo;ve sent a link to reset your password. It&rsquo;s valid for 1 hour.</p>
        </div>
        {state.devLink && (
          <div className="rounded-lg bg-surface-2 p-3 text-xs">
            <p className="font-medium">Dev mode — no email provider configured, so here&rsquo;s the link:</p>
            <Link href={state.devLink} className="break-all font-mono text-primary hover:underline">{state.devLink}</Link>
          </div>
        )}
        <Link href="/login" className="block text-center text-sm font-semibold text-primary hover:underline">Back to sign in</Link>
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
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@example.com" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Sending…" : "Send reset link"}</Button>
      <Link href="/login" className="block text-center text-sm text-muted hover:text-foreground">Back to sign in</Link>
    </form>
  );
}
