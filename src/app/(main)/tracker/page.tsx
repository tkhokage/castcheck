import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TrackerItem, type AppItem } from "./tracker-item";
import { EmptyState, LinkButton, Stat } from "@/components/ui";

export const metadata = { title: "Application tracker" };

const ACTIVE = ["planning", "applied", "submitted", "audition_scheduled", "callback", "offer"];

export default async function TrackerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const apps = await db.application.findMany({
    where: { userId: session.id },
    include: { opportunity: { select: { id: true, title: true, production: true, location: true, type: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const items: AppItem[] = apps.map((a) => ({
    id: a.id,
    status: a.status,
    notes: a.notes,
    deadline: a.deadline?.toISOString() ?? null,
    auditionDate: a.auditionDate?.toISOString() ?? null,
    followUpDate: a.followUpDate?.toISOString() ?? null,
    opportunity: a.opportunity,
  }));

  const active = items.filter((a) => ACTIVE.includes(a.status));
  const closed = items.filter((a) => !ACTIVE.includes(a.status));
  const booked = items.filter((a) => a.status === "booked").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Application tracker</h1>
          <p className="mt-1 text-muted">Every submission from saved to booked, in one place.</p>
        </div>
        <LinkButton href="/discover" variant="outline">Find more opportunities</LinkButton>
      </div>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No applications tracked yet"
            hint="Track an opportunity from any detail page to start following it here."
            action={<LinkButton href="/discover">Browse opportunities</LinkButton>}
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Active" value={active.length} />
            <Stat label="Booked" value={booked} tone="success" />
            <Stat label="Total tracked" value={items.length} />
          </div>

          {active.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 font-semibold">Active</h2>
              <div className="space-y-3">
                {active.map((a) => <TrackerItem key={a.id} app={a} />)}
              </div>
            </section>
          )}

          {closed.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 font-semibold">Closed & archived</h2>
              <div className="space-y-3">
                {closed.map((a) => <TrackerItem key={a.id} app={a} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
