import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, LinkButton, EmptyState } from "@/components/ui";
import { PriorityBadge, TicketStatusBadge } from "@/components/ticket-badges";
import { formatDate } from "@/lib/utils";
import { LifeBuoy, BookOpen, Plus } from "lucide-react";

export const metadata = { title: "Support center" };

export default async function SupportPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tickets = await db.ticket.findMany({
    where: { userId: session.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Support center</h1>
          <p className="mt-1 text-muted">Track your requests and get help.</p>
        </div>
        <LinkButton href="/support/new"><Plus className="h-4 w-4" /> Open a ticket</LinkButton>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/knowledge">
          <Card className="flex items-center gap-3 p-4 hover:shadow-md">
            <BookOpen className="h-5 w-5 text-primary" />
            <div><p className="font-semibold">Knowledge base</p><p className="text-sm text-muted">Guides & how-tos</p></div>
          </Card>
        </Link>
        <Link href="/support/new">
          <Card className="flex items-center gap-3 p-4 hover:shadow-md">
            <LifeBuoy className="h-5 w-5 text-primary" />
            <div><p className="font-semibold">New request</p><p className="text-sm text-muted">Auto-triaged on submit</p></div>
          </Card>
        </Link>
      </div>

      <h2 className="mb-3 mt-8 font-semibold">Your tickets</h2>
      {tickets.length === 0 ? (
        <EmptyState title="No tickets yet" hint="Open a ticket if you run into a problem." />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link key={t.id} href={`/support/${t.id}`}>
              <Card className="flex items-center justify-between gap-3 p-4 hover:shadow-md">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{t.subject}</p>
                  <p className="text-sm text-muted">{t.category} · updated {formatDate(t.updatedAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <TicketStatusBadge status={t.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
