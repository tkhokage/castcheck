import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ImportForm } from "./import-form";
import { Card } from "@/components/ui";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = { title: "Import a listing" };

export default async function ImportPage() {
  if (!(await getSession())) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/find" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Find calls
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight">Import a casting call</h1>
      <p className="mt-1 text-muted">
        Found a call on Actors Access, Backstage, or anywhere else? Paste it here and CASTCHECK will run the same
        verification, risk check, and career-fit on it — then track it for you.
      </p>

      <Card className="mt-6 border-primary/20 bg-primary-soft/40 p-4">
        <div className="flex items-start gap-3 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            This doesn&rsquo;t connect to those sites or store any of your logins — you just paste what you found.
            Your import is private to your account, screened for scam patterns, and (if you add the link) you can run
            a live website check on it.
          </p>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <ImportForm />
      </Card>
    </div>
  );
}
