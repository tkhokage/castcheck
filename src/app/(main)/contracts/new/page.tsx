import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ContractForm } from "./contract-form";
import { Card } from "@/components/ui";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata = { title: "Analyze a contract" };

export default async function NewContractPage() {
  if (!(await getSession())) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/contracts" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Contracts
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight">Analyze a contract</h1>
      <p className="mt-1 text-muted">
        Paste an agency or production agreement and CASTCHECK will explain the key clauses in plain language.
      </p>

      <Card className="mt-6 border-warning/30 bg-warning-soft/40 p-4">
        <div className="flex items-start gap-3 text-sm">
          <Scale className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p>
            <strong>This is not legal advice.</strong> CASTCHECK spots and explains clauses to help you understand
            what you&rsquo;re reading. Before you sign anything with real consequences, have a qualified
            entertainment attorney review it.
          </p>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <ContractForm />
      </Card>
    </div>
  );
}
