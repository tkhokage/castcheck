import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, Badge, LinkButton, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Scale, Plus, ShieldAlert, FileText } from "lucide-react";

export const metadata = { title: "Contract analysis" };

export default async function ContractsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const contracts = await db.contractAnalysis.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Contract analysis</h1>
          <p className="mt-1 text-muted">Understand agency & production contracts before you sign.</p>
        </div>
        <LinkButton href="/contracts/new"><Plus className="h-4 w-4" /> Analyze a contract</LinkButton>
      </div>

      <Card className="mt-6 flex items-start gap-3 border-primary/20 bg-primary-soft/40 p-4 text-sm">
        <Scale className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          CASTCHECK explains clauses like commission, exclusivity, termination, and — importantly — modern
          <strong> AI / digital-likeness</strong> language. It&rsquo;s education, not legal advice: serious items
          always point you to a qualified entertainment attorney.
        </p>
      </Card>

      {contracts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No contracts analyzed yet"
            hint="Paste an agreement to see a plain-language breakdown of its clauses."
            action={<LinkButton href="/contracts/new">Analyze your first contract</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {contracts.map((c) => (
            <Link key={c.id} href={`/contracts/${c.id}`}>
              <Card className="flex items-center justify-between gap-3 p-4 hover:shadow-md">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <FileText className="h-4 w-4 shrink-0 text-muted" /> {c.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{c.source} · {formatDate(c.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {c.flagCount > 0 && (
                    <Badge tone="danger"><ShieldAlert className="h-3.5 w-3.5" /> {c.flagCount} to review</Badge>
                  )}
                  {c.cautionCount > 0 && <Badge tone="warning">{c.cautionCount} caution</Badge>}
                  {c.flagCount === 0 && c.cautionCount === 0 && <Badge tone="neutral">clauses only</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
