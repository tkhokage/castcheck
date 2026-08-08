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

  const where: Prisma.OpportunityWhereInput = { status: { in: ["published", "flagged"] } };
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

  const opps = await db.opportunity.findMany({
    where,
    include: { checks: { select: { status: true } } },
    orderBy: [{ verificationState: "asc" }, { lastVerifiedAt: "desc" }],
  });

  const profile = user?.profile ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Discover</h1>
        <p className="mt-1 text-muted">
          {opps.length} opportunit{opps.length === 1 ? "y" : "ies"} · filtered against evidence, ranked by verification.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
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

        <section>
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
        </section>
      </div>
    </div>
  );
}
