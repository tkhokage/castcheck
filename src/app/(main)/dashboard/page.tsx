import { db } from "@/lib/db";
import { Card, Stat } from "@/components/ui";
import Link from "next/link";

export const metadata = { title: "Operations overview" };

async function group(field: "verificationState" | "riskLevel" | "status") {
  const rows = await db.opportunity.groupBy({ by: [field], _count: true });
  return Object.fromEntries(rows.map((r) => [r[field], r._count])) as Record<string, number>;
}

export default async function DashboardOverview() {
  const [ver, risk, tickets, openTickets, highTickets, reports, openReports, incidents, openRisks] = await Promise.all([
    group("verificationState"),
    group("riskLevel"),
    db.ticket.count(),
    db.ticket.count({ where: { status: { in: ["open", "in_progress", "waiting"] } } }),
    db.ticket.count({ where: { priority: { in: ["high", "critical"] }, status: { notIn: ["resolved", "closed"] } } }),
    db.report.count(),
    db.report.count({ where: { status: { in: ["open", "reviewing"] } } }),
    db.incident.count(),
    db.riskRegisterEntry.count({ where: { status: "active" } }),
  ]);

  return (
    <div className="space-y-8">
      <Section title="Opportunities" href="/dashboard/moderation">
        <Stat label="Verified" value={ver.verified ?? 0} tone="success" />
        <Stat label="Partial" value={ver.partial ?? 0} tone="info" />
        <Stat label="Needs review" value={ver.needs_review ?? 0} />
        <Stat label="Flagged" value={ver.flagged ?? 0} tone="warning" />
        <Stat label="High risk" value={ver.high_risk ?? 0} tone="danger" />
      </Section>

      <Section title="Risk">
        <Stat label="Low" value={risk.low ?? 0} tone="success" />
        <Stat label="Moderate" value={risk.moderate ?? 0} tone="warning" />
        <Stat label="High" value={risk.high ?? 0} tone="danger" />
        <Stat label="Critical" value={risk.critical ?? 0} tone="danger" />
      </Section>

      <Section title="Support" href="/dashboard/tickets">
        <Stat label="Open tickets" value={openTickets} tone="warning" />
        <Stat label="High priority" value={highTickets} tone="danger" />
        <Stat label="Total tickets" value={tickets} />
      </Section>

      <Section title="Trust & safety" href="/dashboard/moderation">
        <Stat label="Reports total" value={reports} />
        <Stat label="Open reports" value={openReports} tone="warning" />
        <Stat label="Suspicious listings" value={(ver.flagged ?? 0) + (ver.high_risk ?? 0)} tone="danger" />
      </Section>

      <Section title="Governance, risk & compliance" href="/dashboard/grc">
        <Stat label="Active risks" value={openRisks} tone="warning" />
        <Stat label="Incidents" value={incidents} />
      </Section>
    </div>
  );
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {href && <Link href={href} className="text-sm font-medium text-primary hover:underline">View →</Link>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{children}</div>
    </section>
  );
}
