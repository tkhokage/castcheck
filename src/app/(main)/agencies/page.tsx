import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AgencyFilters } from "./filters";
import { AgencyCard } from "@/components/agency-card";
import { Card, EmptyState } from "@/components/ui";
import { agencyMatch } from "@/lib/matching";
import { asList } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Talent agencies" };

export default async function AgenciesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();

  const where: Prisma.AgencyWhereInput = {};
  if (sp.location) where.location = { contains: sp.location.split(",")[0] };
  if (sp.q) where.name = { contains: sp.q };

  let agencies = await db.agency.findMany({ where, orderBy: { verificationState: "asc" } });
  if (sp.specialty) {
    agencies = agencies.filter((a) => asList(a.representationSpecialties).map(String).includes(sp.specialty!));
  }

  const profile = user?.profile ?? null;
  const withMatch = agencies
    .map((a) => ({
      agency: a,
      match: profile ? agencyMatch(profile, a).score : null,
    }))
    .sort((x, y) => (y.match ?? 0) - (x.match ?? 0));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Talent agencies</h1>
      <p className="mt-1 text-muted">
        Search representation by region and specialty — matched to your resume, with the same trust lens.
      </p>

      <Card className="mt-6 p-5">
        <AgencyFilters />
      </Card>

      {!profile && (
        <Card className="mt-4 bg-primary-soft p-4 text-sm">
          <span className="font-semibold text-primary">Get match scores:</span>{" "}
          <span className="text-muted">complete your profile and we&rsquo;ll rank agencies by fit to your goals.</span>
        </Card>
      )}

      {withMatch.length === 0 ? (
        <div className="mt-8"><EmptyState title="No agencies match" hint="Try a different location or representation type." /></div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withMatch.map(({ agency, match }) => (
            <AgencyCard key={agency.id} agency={{ ...agency, matchScore: match }} />
          ))}
        </div>
      )}
    </div>
  );
}
