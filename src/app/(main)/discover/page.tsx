import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DiscoverFilters } from "./filters";
import { OpportunityCard } from "@/components/opportunity-card";
import { Card, EmptyState } from "@/components/ui";
import { careerFit } from "@/lib/matching";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Discover opportunities" };

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();

  const page = Math.min(10000, Math.max(1, Number.parseInt(sp.page || "1", 10) || 1));
  const where: Prisma.OpportunityWhereInput = {
    status: { in: ["published", "flagged"] },
    isDemo: sp.demo === "1",
    ...(sp.expired === "1" ? {} : { AND: [{ OR: [{ deadline: null }, { deadline: { gte: new Date() } }] }] }),
  };
  if (sp.type) where.type = sp.type;
  if (sp.location) where.location = sp.location;
  if (sp.compensation) where.compensation = sp.compensation;
  if (sp.roleType) where.roleType = sp.roleType;
  if (sp.experience) where.experienceLevel = sp.experience;
  if (sp.productionType) where.productionType = sp.productionType;
  if (sp.safe === "1") where.verificationState = { notIn: ["flagged", "high_risk", "rejected"] };
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q } },
      { role: { contains: sp.q } },
      { production: { contains: sp.q } },
      { productionCompany: { contains: sp.q } },
    ];
  }

  const [opps, total] = await Promise.all([db.opportunity.findMany({
    where,
    include: { checks: { select: { status: true } } },
    orderBy: sp.sort === "deadline" ? [{ deadline: "asc" }, { id: "asc" }] : [{ createdAt: "desc" }, { id: "asc" }],
    take: 24,
    skip: (page - 1) * 24,
  }), db.opportunity.count({ where })]);
  function pageHref(target: number) {
    const params = new URLSearchParams(Object.entries(sp).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    params.set("page", String(target));
    return `/discover?${params}`;
  }

  const profile = user?.profile ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 rounded bg-primary-soft px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">Casting calls</span>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight">Casting calls</h1>
          <p className="mt-1 text-muted">
            {total} {sp.demo === "1" ? "sample" : "non-demo"} call{total === 1 ? "" : "s"} · review source evidence before applying.
            Looking for representation instead? <Link href="/agencies" className="font-medium text-primary hover:underline">Browse agencies</Link>.
          </p>
        </div>
        <Link href="/find" className="text-sm font-semibold text-primary hover:underline">+ Find calls on other sites</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Filters</h2>
            <DiscoverFilters />
          </Card>
          {!user && (
            <Card className="mt-4 bg-primary-soft p-4 text-sm">
              <p className="font-semibold text-primary">See your career fit</p>
              <p className="mt-1 text-muted">Sign in to see how each opportunity matches your resume and goals.</p>
            </Card>
          )}
        </aside>

        <section aria-label="Casting results">
          {sp.demo === "1" && <p className="mb-4 rounded-lg bg-warning-soft p-4 text-sm text-warning">You are viewing fictional sample listings. They are not real auditions.</p>}
          {opps.length === 0 ? (
            <EmptyState title="No opportunities match your filters" hint="Try clearing a filter or widening your search." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {opps.map((o) => {
                const fit = profile
                  ? careerFit(profile, {
                      type: o.type, location: o.location, roleType: o.roleType,
                      compensation: o.compensation, productionType: o.productionType, experienceLevel: o.experienceLevel,
                    }).score
                  : null;
                return <OpportunityCard key={o.id} opp={{ ...o, fitScore: fit }} />;
              })}
            </div>
          )}
          {total > 24 && <nav aria-label="Results pages" className="mt-6 flex items-center justify-between gap-3">
            {page > 1 ? <Link href={pageHref(page - 1)} className="font-semibold text-primary">Previous</Link> : <span />}
            <span className="text-sm text-muted">Page {page} of {Math.ceil(total / 24)}</span>
            {page * 24 < total ? <Link href={pageHref(page + 1)} className="font-semibold text-primary">Next</Link> : <span />}
          </nav>}
        </section>
      </div>
    </div>
  );
}
