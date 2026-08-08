import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { Card, Badge, EmptyState } from "@/components/ui";
import { VerificationBadge, RiskBadge } from "@/components/badges";
import { ModControls, ReportControls } from "./mod-controls";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Moderation" };

export default async function ModerationPage() {
  const session = await getSession();
  if (!can(session?.role, "moderation.view")) redirect("/dashboard");

  const [queue, reports] = await Promise.all([
    db.opportunity.findMany({
      where: { OR: [{ status: { in: ["flagged", "draft"] } }, { verificationState: { in: ["needs_review", "flagged", "high_risk"] } }] },
      include: { riskIndicators: true, _count: { select: { reports: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.report.findMany({
      where: { status: { in: ["open", "reviewing"] } },
      include: { opportunity: { select: { id: true, title: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-1 font-semibold">Opportunity review queue</h2>
        <p className="mb-4 text-sm text-muted">Listings needing a moderation decision. Career fit never overrides a risk warning.</p>
        {queue.length === 0 ? (
          <EmptyState title="Queue is clear" hint="No opportunities need review right now." />
        ) : (
          <div className="space-y-3">
            {queue.map((o) => (
              <Card key={o.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/opportunities/${o.id}`} className="font-semibold hover:text-primary">{o.title}</Link>
                    <p className="mt-0.5 text-sm text-muted">{o.type} · {o.location} · added {formatDate(o.createdAt)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <VerificationBadge state={o.verificationState} />
                      <RiskBadge level={o.riskLevel} />
                      {o._count.reports > 0 && <Badge tone="danger">{o._count.reports} report{o._count.reports > 1 ? "s" : ""}</Badge>}
                      {o.riskIndicators.length > 0 && <Badge tone="warning">{o.riskIndicators.length} indicators</Badge>}
                    </div>
                  </div>
                  <ModControls id={o.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 font-semibold">User reports</h2>
        <p className="mb-4 text-sm text-muted">Each report is a trust & safety item.</p>
        {reports.length === 0 ? (
          <EmptyState title="No open reports" />
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="danger">{r.reason}</Badge>
                      <Badge tone="neutral">{r.status}</Badge>
                    </div>
                    <Link href={`/opportunities/${r.opportunity.id}`} className="mt-2 block font-medium hover:text-primary">
                      {r.opportunity.title}
                    </Link>
                    {r.details && <p className="mt-1 text-sm text-muted">{r.details}</p>}
                    <p className="mt-1 text-xs text-muted-2">Reported by {r.user?.name ?? "anonymous"} · {formatDate(r.createdAt)}</p>
                  </div>
                  <ReportControls id={r.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
