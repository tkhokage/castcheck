import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, Badge, LinkButton } from "@/components/ui";
import { contractNarrative, aiEnabled } from "@/lib/ai";
import { CONCERN_META, type ClauseFinding } from "@/lib/contract";
import { formatDate } from "@/lib/utils";
import { DeleteContractButton } from "./delete-button";
import { ArrowLeft, Scale, ShieldAlert, Sparkles, Info, Percent } from "lucide-react";

export default async function ContractDetail({ params }: PageProps<"/contracts/[id]">) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const record = await db.contractAnalysis.findUnique({ where: { id } });
  if (!record || record.userId !== session.id) notFound();

  const findings = (record.findings as unknown as ClauseFinding[]) ?? [];
  const flags = findings.filter((f) => f.concern === "high");
  const order = { high: 0, caution: 1, info: 2 } as const;
  const sorted = [...findings].sort((a, b) => order[a.concern] - order[b.concern]);

  const narrative = await contractNarrative({
    findings: findings.map((f) => ({ label: f.label, concern: f.concern, explain: f.explain })),
    flags: flags.map((f) => f.label),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/contracts" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Contracts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{record.title}</h1>
          <p className="mt-0.5 text-sm text-muted">{record.source} · analyzed {formatDate(record.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          {flags.length > 0 && <Badge tone="danger"><ShieldAlert className="h-3.5 w-3.5" /> {flags.length} to review</Badge>}
          {typeof record.commissionPct === "number" && (
            <Badge tone={record.commissionPct > 20 ? "danger" : "neutral"}><Percent className="h-3.5 w-3.5" /> {record.commissionPct}% commission</Badge>
          )}
        </div>
      </div>

      {/* Not-legal-advice banner */}
      <Card className="mt-5 flex items-start gap-3 border-warning/30 bg-warning-soft/40 p-4 text-sm">
        <Scale className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p>{record.summary} <span className="text-muted">{"— "}This is not legal advice; have an entertainment attorney review anything serious before signing.</span></p>
      </Card>

      {/* AI / rule-based plain-language summary */}
      <Card className="mt-4 p-5">
        <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
          {aiEnabled() ? <Sparkles className="h-4 w-4 text-primary" /> : <Info className="h-4 w-4 text-muted" />}
          Plain-language summary
          <Badge tone={narrative.source === "ai" ? "primary" : "neutral"} className="ml-1">
            {narrative.source === "ai" ? "AI-assisted" : "Rule-based"} · {narrative.confidence} confidence
          </Badge>
        </div>
        <p className="text-sm text-muted">{narrative.data.summary}</p>
      </Card>

      {/* Findings */}
      <h2 className="mb-3 mt-8 font-semibold">Clause-by-clause</h2>
      {sorted.length === 0 ? (
        <Card className="p-6 text-sm text-muted">
          No recognizable clauses were detected. Make sure you pasted the full agreement text.
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((f, i) => {
            const meta = CONCERN_META[f.concern];
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{f.label}</h3>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <blockquote className="mt-2 border-l-2 border-border-strong pl-3 text-sm italic text-muted">
                  &ldquo;{f.excerpt}&rdquo;
                </blockquote>
                <p className="mt-2 text-sm">{f.explain}</p>
                <p className="mt-1 text-sm text-muted"><span className="font-medium text-foreground">What to check:</span> {f.watchFor}</p>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-surface-2 p-5">
        <div className="text-sm">
          <p className="font-semibold">Anything here give you pause?</p>
          <p className="text-muted">Don&rsquo;t sign under pressure. A qualified entertainment attorney can review it with you.</p>
        </div>
        <LinkButton href="/knowledge/how-to-evaluate-a-talent-agency" variant="outline">Evaluate an agency</LinkButton>
      </Card>

      <div className="mt-4 flex justify-end">
        <DeleteContractButton id={record.id} />
      </div>
    </div>
  );
}
