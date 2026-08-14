"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resendVerification } from "@/app/actions/account";
import { Button, Badge } from "@/components/ui";
import { MailCheck, Mail } from "lucide-react";

export function VerifyPanel({ verified }: { verified: boolean }) {
  const [link, setLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function resend() {
    setError(null);
    start(async () => {
      const res = await resendVerification();
      if ("error" in res) setError(res.error);
      else if (res.delivered) setSent(true);
      else setLink(res.link ?? null);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {verified ? <MailCheck className="h-5 w-5 text-success" /> : <Mail className="h-5 w-5 text-muted" />}
          <span className="font-semibold">Email verification</span>
        </div>
        <Badge tone={verified ? "success" : "warning"}>{verified ? "Verified" : "Unverified"}</Badge>
      </div>

      {verified ? (
        <p className="mt-1 text-sm text-muted">Your email address is verified.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            Verify your email to secure your account. We&rsquo;ll email you a verification link.
          </p>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          {sent ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-success-soft p-3 text-sm text-success">
              <MailCheck className="h-4 w-4" /> Verification email sent — check your inbox.
            </div>
          ) : link ? (
            <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">
              <p className="font-medium">Dev mode — no email provider configured, so here&rsquo;s the link:</p>
              <Link href={link} className="break-all font-mono text-xs text-primary hover:underline">{link}</Link>
            </div>
          ) : (
            <Button className="mt-4" variant="outline" onClick={resend} disabled={pending}>
              {pending ? "Sending…" : "Send verification email"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
