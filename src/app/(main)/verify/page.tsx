import Link from "next/link";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { Card, LinkButton } from "@/components/ui";
import { MailCheck, XCircle } from "lucide-react";

export const metadata = { title: "Verify email" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { token } = await searchParams;
  let ok = false;

  if (token) {
    const user = await db.user.findFirst({ where: { verifyToken: token } });
    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), verifyToken: null },
      });
      await audit({ userId: user.id, action: "email.verified", resource: `user:${user.id}` });
      ok = true;
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <Card className="p-8">
        {ok ? (
          <>
            <MailCheck className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 text-2xl font-bold">Email verified</h1>
            <p className="mt-2 text-muted">Your email address is confirmed. Thanks for securing your account.</p>
            <LinkButton href="/settings" className="mt-6">Back to settings</LinkButton>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-danger" />
            <h1 className="mt-4 text-2xl font-bold">Invalid or expired link</h1>
            <p className="mt-2 text-muted">This verification link is no longer valid. Request a fresh one from settings.</p>
            <LinkButton href="/settings" variant="outline" className="mt-6">Go to settings</LinkButton>
          </>
        )}
      </Card>
      <p className="mt-4 text-sm text-muted"><Link href="/discover" className="hover:underline">Continue to CASTCHECK</Link></p>
    </div>
  );
}
