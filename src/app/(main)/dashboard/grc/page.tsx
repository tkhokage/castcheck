import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { Card, Badge } from "@/components/ui";
import { riskLevel, RISK_LEVEL_TONE } from "@/lib/risk";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "GRC" };

const CONTROL_MATRIX = [
  ["Fake casting call", "Opportunity verification"],
  ["Scam", "Risk assessment"],
  ["Unauthorized access", "RBAC"],
  ["Account takeover", "MFA"],
  ["Data exposure", "Data classification"],
  ["Suspicious listing", "Reporting workflow"],
  ["Platform issue", "IT ticketing"],
  ["Excessive permissions", "Access review"],
  ["Data loss", "Backup and recovery"],
];

const ASSETS = [
  "User accounts", "Actor profiles", "Opportunity records", "Agency records", "Support tickets",
  "Uploaded documents", "Application records", "Authentication systems", "Database resources",
];

const SEV_TONE: Record<string, string> = { critical: "danger", high: "danger", medium: "warning", low: "neutral" };

export default async function GrcPage() {
  const session = await getSession();
  if (!can(session?.role, "grc.view")) redirect("/dashboard");

  const [register, incidents] = await Promise.all([
    db.riskRegisterEntry.findMany(),
    db.incident.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  register.sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact);

  return (
    <div className="space-y-10">
      {/* Risk register */}
      <section>
        <h2 className="mb-1 font-semibold">Risk register</h2>
        <p className="mb-4 text-sm text-muted">Inherent risk = likelihood × impact. Residual reflects controls in place.</p>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-surface-2 text-left text-xs uppercase text-muted">
              <tr>
                <th className="p-3">Risk</th><th className="p-3">L</th><th className="p-3">I</th>
                <th className="p-3">Inherent</th><th className="p-3">Control</th><th className="p-3">Residual</th>
                <th className="p-3">Owner</th><th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {register.map((r) => {
                const inherent = r.likelihood * r.impact;
                return (
                  <tr key={r.id}>
                    <td className="p-3 font-medium">{r.risk}</td>
                    <td className="p-3">{r.likelihood}</td>
                    <td className="p-3">{r.impact}</td>
                    <td className="p-3"><Badge tone={RISK_LEVEL_TONE[riskLevel(inherent)]}>{inherent}</Badge></td>
                    <td className="p-3 text-muted">{r.control}</td>
                    <td className="p-3"><Badge tone={RISK_LEVEL_TONE[riskLevel(r.residual)]}>{r.residual}</Badge></td>
                    <td className="p-3 text-muted">{r.owner}</td>
                    <td className="p-3"><Badge tone="success">{r.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Control matrix + assets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">Control matrix</h2>
          <Card className="divide-y divide-border">
            {CONTROL_MATRIX.map(([risk, control]) => (
              <div key={risk} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="text-muted">{risk}</span>
                <Badge tone="primary">{control}</Badge>
              </div>
            ))}
          </Card>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Asset inventory</h2>
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {ASSETS.map((a) => <Badge key={a} tone="neutral">{a}</Badge>)}
            </div>
            <p className="mt-4 text-xs text-muted">
              GRC model — every major risk assessment answers nine questions: asset, threat, vulnerability, risk,
              control, evidence, owner, status, remediation.
            </p>
          </Card>
        </section>
      </div>

      {/* Incidents */}
      <section>
        <h2 className="mb-1 font-semibold">Incident register</h2>
        <p className="mb-4 text-sm text-muted">Detection → Triage → Containment → Investigation → Remediation → Recovery → Lessons learned.</p>
        <div className="space-y-3">
          {incidents.map((i) => (
            <Card key={i.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{i.reference}</span>
                  <Badge tone={SEV_TONE[i.severity] ?? "neutral"}>{i.severity}</Badge>
                  <Badge tone="neutral">{i.category}</Badge>
                  <Badge tone={i.status === "resolved" ? "success" : "warning"}>{i.status}</Badge>
                </div>
                <span className="text-xs text-muted-2">{formatDate(i.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm">{i.summary}</p>
              <div className="mt-2 grid gap-2 text-xs text-muted sm:grid-cols-2">
                {i.immediateActions && <p><span className="font-medium text-foreground">Immediate:</span> {i.immediateActions}</p>}
                {i.recommendedActions && <p><span className="font-medium text-foreground">Recommended:</span> {i.recommendedActions}</p>}
                {i.lessonsLearned && <p className="sm:col-span-2"><span className="font-medium text-foreground">Lessons:</span> {i.lessonsLearned}</p>}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
