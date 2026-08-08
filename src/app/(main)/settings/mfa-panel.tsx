"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { beginMfa, confirmMfa, disableMfa } from "@/app/actions/account";
import { Button, Badge, inputClass } from "@/components/ui";
import { ShieldCheck, ShieldOff, Check } from "lucide-react";

export function MfaPanel({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [enroll, setEnroll] = useState<{ secret: string; qr: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function begin() {
    setError(null);
    start(async () => {
      const res = await beginMfa();
      if ("error" in res) setError(res.error);
      else setEnroll({ secret: res.secret, qr: res.qr });
    });
  }

  function confirm(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await confirmMfa(undefined, formData);
      if (res?.error) setError(res.error);
      else { setOn(true); setEnroll(null); }
    });
  }

  function disable(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await disableMfa(undefined, formData);
      if (res?.error) setError(res.error);
      else setOn(false);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {on ? <ShieldCheck className="h-5 w-5 text-success" /> : <ShieldOff className="h-5 w-5 text-muted" />}
          <span className="font-semibold">Two-factor authentication</span>
        </div>
        <Badge tone={on ? "success" : "neutral"}>{on ? "Enabled" : "Disabled"}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted">
        Protects against account takeover even if your password is exposed. Use any authenticator app
        (Google Authenticator, Authy, 1Password).
      </p>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {!on && !enroll && (
        <Button className="mt-4" onClick={begin} disabled={pending}>
          {pending ? "Preparing…" : "Enable 2FA"}
        </Button>
      )}

      {!on && enroll && (
        <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
          <p className="text-sm font-medium">1. Scan this QR with your authenticator app</p>
          <div className="mt-2 inline-block rounded-lg bg-white p-2">
            <Image src={enroll.qr} alt="MFA QR code" width={180} height={180} unoptimized />
          </div>
          <p className="mt-2 text-sm text-muted">
            Or enter this key manually:{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs break-all">{enroll.secret}</code>
          </p>
          <form action={confirm} className="mt-4 flex items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">2. Enter the 6-digit code</span>
              <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required
                className={`${inputClass} w-32 font-mono tracking-widest`} placeholder="000000" />
            </label>
            <Button type="submit" disabled={pending}>Confirm</Button>
          </form>
        </div>
      )}

      {on && (
        <form action={disable} className="mt-4 flex items-end gap-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Enter a code to disable 2FA</span>
            <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required
              className={`${inputClass} w-32 font-mono tracking-widest`} placeholder="000000" />
          </label>
          <Button type="submit" variant="outline" disabled={pending}>Disable</Button>
        </form>
      )}

      {on && !enroll && (
        <p className="mt-3 inline-flex items-center gap-1 text-sm text-success">
          <Check className="h-4 w-4" /> You&rsquo;ll be asked for a code at sign-in.
        </p>
      )}
    </div>
  );
}
