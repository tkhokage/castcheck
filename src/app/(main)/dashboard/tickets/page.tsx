import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { Card, Badge, Stat, EmptyState } from "@/components/ui";
import { PriorityBadge, TicketStatusBadge } from "@/components/ticket-badges";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Ticket queue" };

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

export default async function TicketQueue({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await getSession();
  if (!can(session?.role, "ticket.work")) redirect("/dashboard");
  const sp = await searchParams;

  const tickets = await db.ticket.findMany({
    where: sp.status ? { status: sp.status } : {},
    include: { user: { select: { name: true } }, assigned: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  tickets.sort((a, b) => (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 9) - (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 9));

  const open = tickets.filter((t) => !["resolved", "closed"].includes(t.status));
  const resolved = tickets.filter((t) => t.status === "resolved");
  const closed = tickets.filter((t) => t.status === "closed");
  const resolutionRate = tickets.length ? Math.round(((resolved.length + closed.length) / tickets.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Open" value={open.length} tone="warning" />
        <Stat label="Critical/High" value={open.filter((t) => ["critical", "high"].includes(t.priority)).length} tone="danger" />
        <Stat label="Resolution rate" value={`${resolutionRate}%`} tone="success" />
        <Stat label="Total" value={tickets.length} />
      </div>

      {tickets.length === 0 ? (
        <EmptyState title="No tickets" />
      ) : (
        <Card className="divide-y divide-border">
          {tickets.map((t) => (
            <Link key={t.id} href={`/support/${t.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-surface-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{t.subject}</p>
                <p className="text-sm text-muted">
                  <span className="font-mono">#{t.id.slice(-6).toUpperCase()}</span> · {t.category} · {t.user?.name ?? "—"}
                  {t.assigned ? ` · ${t.assigned.name}` : " · unassigned"} · {formatDate(t.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <PriorityBadge priority={t.priority} />
                <TicketStatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
