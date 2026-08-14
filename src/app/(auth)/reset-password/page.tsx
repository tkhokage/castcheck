import Link from "next/link";
import { ResetForm } from "./reset-form";
import { Card } from "@/components/ui";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-bold">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-fg">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="text-xl">CAST<span className="text-primary">CHECK</span></span>
      </Link>
      <Card className="p-6">
        <h1 className="text-xl font-bold">Choose a new password</h1>
        {token ? (
          <>
            <p className="mt-1 mb-6 text-sm text-muted">Enter a new password for your account.</p>
            <ResetForm token={token} />
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">
            This page needs a valid reset link. <Link href="/forgot-password" className="font-semibold text-primary hover:underline">Request a new one</Link>.
          </p>
        )}
      </Card>
    </div>
  );
}
