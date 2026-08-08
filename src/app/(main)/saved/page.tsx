import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { OpportunityCard } from "@/components/opportunity-card";
import { EmptyState, LinkButton } from "@/components/ui";
import { careerFit } from "@/lib/matching";

export const metadata = { title: "Saved opportunities" };

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const saved = await db.savedOpportunity.findMany({
    where: { userId: user.id },
    include: { opportunity: { include: { checks: { select: { status: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Saved</h1>
      <p className="mt-1 text-muted">{saved.length} saved opportunit{saved.length === 1 ? "y" : "ies"}.</p>

      {saved.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing saved yet"
            hint="Tap Save on any opportunity to keep it here."
            action={<LinkButton href="/discover">Browse opportunities</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => {
            const fit = user.profile
              ? careerFit(user.profile, {
                  type: s.opportunity.type, location: s.opportunity.location, roleType: s.opportunity.roleType,
                  compensation: s.opportunity.compensation, productionType: s.opportunity.productionType, experienceLevel: s.opportunity.experienceLevel,
                }).score
              : null;
            return <OpportunityCard key={s.id} opp={{ ...s.opportunity, fitScore: fit }} />;
          })}
        </div>
      )}
    </div>
  );
}
