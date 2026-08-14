import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";
import { Card, Badge } from "@/components/ui";
import { PriorityBadge, TicketStatusBadge } from "@/components/ticket-badges";
import { StaffPanel } from "./staff-panel";
import { SuccessBanner } from "@/components/flash";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const CHECKLISTS: Record<string, string[]> = {
  "Upload problems": ["Verify account", "Verify file type", "Verify file size", "Test browser", "Test upload service", "Reproduce", "Resolve", "Document resolution"],
  "Login problems": ["Verify account exists", "Check lockout status", "Confirm email", "Test reset flow", "Reproduce", "Resolve", "Document"],
  "Suspicious opportunities": ["Confirm report", "Review listing", "Cross-reference indicators", "Escalate to moderation", "Notify affected users", "Document"],
};
const DEFAULT_CHECKLIST = ["Verify account", "Reproduce the issue", "Identify root cause", "Apply fix or guidance", "Confirm with user", "Document resolution"];

export default async function TicketDetail({ params, searchParams }: PageProps<"/support/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } }, assigned: { select: { name: true } } },
  });
  if (!ticket) notFound();

  const isStaff = can(session.role, "ticket.work");
  const isOwner = ticket.userId === session.id;
  if (!isStaff && !isOwner) redirect("/support");

  const checklist = CHECKLISTS[ticket.category] ?? DEFAULT_CHECKLIST;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={isStaff ? "/dashboard/tickets" : "/support"} className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {created && (
        <SuccessBanner>
          <strong>Ticket submitted.</strong> We&rsquo;ve auto-categorized and prioritized it — our support team will
          follow up. You can track its status right here.
        </SuccessBanner>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-mono">#{ticket.id.slice(-6).toUpperCase()}</span>
            <span>·</span>
            <span>{ticket.category}</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-muted">Description</h2>
        <p className="mt-2 whitespace-pre-line">{ticket.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm sm:grid-cols-4">
          <Meta label="Opened" value={formatDate(ticket.createdAt)} />
          <Meta label="Updated" value={formatDate(ticket.updatedAt)} />
          <Meta label="Assigned" value={ticket.assigned?.name ?? "Unassigned"} />
          <Meta label="Closed" value={ticket.closedAt ? formatDate(ticket.closedAt) : "—"} />
        </div>
      </Card>

      {ticket.resolution && (
        <Card className="mt-4 border-success/30 bg-success-soft/40 p-5">
          <h2 className="text-sm font-semibold text-success">Resolution</h2>
          <p className="mt-1 text-sm">{ticket.resolution}</p>
        </Card>
      )}

      {isStaff && (
        <>
          <Card className="mt-4 p-5">
            <h2 className="text-sm font-semibold text-muted">Requester</h2>
            <p className="mt-1 text-sm">{ticket.user?.name} · {ticket.user?.email}</p>
            {ticket.internalNotes && (
              <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">
                <p className="font-medium">Internal notes</p>
                <p className="mt-1 text-muted">{ticket.internalNotes}</p>
              </div>
            )}
          </Card>

          <Card className="mt-4 p-5">
            <h2 className="text-sm font-semibold text-muted">Resolution workflow — {ticket.category}</h2>
            <ol className="mt-3 space-y-1.5 text-sm">
              {checklist.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>

          <div className="mt-4">
            <StaffPanel ticket={ticket} />
          </div>
        </>
      )}

      {!isStaff && ticket.status !== "closed" && (
        <Card className="mt-4 p-4 text-sm text-muted">
          <Badge tone="info">In queue</Badge>
          <span className="ml-2">Our support team has your ticket and will follow up.</span>
        </Card>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-2">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
