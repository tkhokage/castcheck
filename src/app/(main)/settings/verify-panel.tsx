"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resendVerification } from "@/app/actions/account";
import { Button, Badge } from "@/components/ui";
import { MailCheck, Mail } from "lucide-react";

export function VerifyPanel({ verified }: { verified: boolean }) {
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function resend() {
    setError(null);
    start(async () => {
      const res = await resendVerification();
      if ("error" in res) setError(res.error);
      else setLink(res.link);
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
            Verify your email to secure your account. This build has no email provider, so the link is shown
            here for the demo.
          </p>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          {link ? (
            <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">
              <p className="font-medium">Verification link (demo):</p>
              <Link href={link} className="break-all font-mono text-xs text-primary hover:underline">{link}</Link>
            </div>
          ) : (
            <Button className="mt-4" variant="outline" onClick={resend} disabled={pending}>
              {pending ? "Generating…" : "Get verification link"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
