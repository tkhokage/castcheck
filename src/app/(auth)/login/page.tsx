import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "../auth-form";
import { Card } from "@/components/ui";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getSession()) redirect("/discover");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-bold">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-fg">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="text-xl">
          CAST<span className="text-primary">CHECK</span>
        </span>
      </Link>

      <Card className="p-6">
        <h1 className="text-xl font-bold">Welcome back</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Sign in to find, verify, and pursue opportunities.</p>
        <AuthForm mode="login" />
      </Card>

      {process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true" && (
        <Card className="mt-4 p-4 text-sm">
          <p className="font-semibold">Demo accounts</p>
          <p className="mt-1 text-muted">
            Try any role — password <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-xs">demo1234</code>:
          </p>
          <ul className="mt-2 grid grid-cols-1 gap-1 font-mono text-xs text-muted sm:grid-cols-2">
            <li>actor@castcheck.app</li>
            <li>moderator@castcheck.app</li>
            <li>support@castcheck.app</li>
            <li>grc@castcheck.app</li>
            <li>admin@castcheck.app</li>
            <li>casting@castcheck.app</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
