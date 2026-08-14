import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "../auth-form";
import { Card } from "@/components/ui";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
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
        <h1 className="text-xl font-bold">Create your account</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Find real opportunities, check them against evidence, and track your pursuit.
        </p>
        <AuthForm mode="register" />
        <p className="mt-4 text-center text-xs text-muted">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="font-medium text-primary hover:underline">Terms of Use</Link> and{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </Card>

      <p className="mt-4 px-2 text-center text-xs text-muted">
        CASTCHECK never asks for your SSN, government ID, or banking information. We collect only what a
        professional acting profile needs.
      </p>
    </div>
  );
}
