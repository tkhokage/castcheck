"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, register, type AuthState } from "@/app/actions/auth";
import { Button, Field, inputClass } from "@/components/ui";
import { AlertCircle, ShieldCheck } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? login : register;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);
  const mfa = mode === "login" && state?.mfaRequired;

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {mfa && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary-soft px-3 py-2 text-sm text-primary">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Two-factor is enabled. Enter the code from your authenticator app.
        </div>
      )}

      {mode === "register" && (
        <Field label="Full name">
          <input name="name" required className={inputClass} placeholder="Jordan Rivera" autoComplete="name" />
        </Field>
      )}

      <Field label="Email">
        <input name="email" type="email" required className={inputClass} placeholder="you@example.com" autoComplete="email" />
      </Field>

      <Field label="Password" hint={mode === "register" ? "At least 8 characters." : undefined}>
        <input
          name="password"
          type="password"
          required
          className={inputClass}
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </Field>

      {mode === "login" && (
        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      )}

      {mfa && (
        <Field label="Authentication code" hint="Lost your device? Enter a recovery code instead.">
          <input
            name="code"
            required
            autoFocus
            className={`${inputClass} font-mono tracking-widest`}
            placeholder="000000 or recovery code"
            autoComplete="one-time-code"
          />
        </Field>
      )}

      {mode === "register" && (
        <Field label="I am a…">
          <select name="role" className={inputClass} defaultValue="actor">
            <option value="actor">Actor looking for opportunities</option>
            <option value="casting">Casting professional</option>
            <option value="agency">Talent agency</option>
          </select>
        </Field>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : mfa ? "Verify & sign in" : mode === "login" ? "Sign in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New to CASTCHECK?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
