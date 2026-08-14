import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, Badge } from "@/components/ui";
import { VerificationBadge, TrustLevelBadge } from "@/components/badges";
import { agencyMatch } from "@/lib/matching";
import { LiveCheck } from "@/components/live-check";
import { asList, monthYear } from "@/lib/utils";
import { ArrowLeft, MapPin, Globe, Mail, Phone, AlertTriangle } from "lucide-react";

export default async function AgencyDetail({ params }: PageProps<"/agencies/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  const agency = await db.agency.findUnique({ where: { id } });
  if (!agency) notFound();

  const match = user?.profile ? agencyMatch(user.profile, agency) : null;
  const specialties = asList(agency.representationSpecialties).map(String);
  const markets = asList(agency.marketsServed).map(String);
  const reqs = asList(agency.submissionRequirements).map(String);
  const feeWarning = agency.fees && /upfront|mandatory|photo package|pay/i.test(agency.fees) && !/no upfront/i.test(agency.fees);
  const dangerous = ["flagged", "high_risk", "rejected"].includes(agency.verificationState);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/agencies" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to agencies
      </Link>

      {(dangerous || feeWarning) && (
        <div className="mb-6 flex items-start gap-3 rounded-[var(--radius)] border border-danger/40 bg-danger-soft p-4 text-danger">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Caution advised.</p>
            <p>
              Legitimate agencies earn commission from work you book — they do not require large upfront fees or
              mandatory in-house photo packages to sign you, and they never guarantee representation.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge state={agency.verificationState} />
            <TrustLevelBadge level={agency.trustLevel} />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{agency.name}</h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-muted"><MapPin className="h-4 w-4" /> {agency.location}</p>

          {agency.businessInfo && <p className="mt-4 text-muted">{agency.businessInfo}</p>}

          <div className="mt-5 flex flex-wrap gap-2">
            {specialties.map((s) => <Badge key={s} tone="primary">{s}</Badge>)}
          </div>

          <Card className="mt-6 p-5">
            <h2 className="font-semibold">Representation details</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <Row label="Markets served" value={markets.join(", ") || "—"} />
              <Row label="Submission method" value={agency.submissionMethod ?? "—"} />
              <Row label="Commission" value={agency.commission ?? "—"} />
              <Row label="Fees" value={agency.fees ?? "—"} tone={feeWarning ? "danger" : undefined} />
            </dl>
            {reqs.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">Submission requirements</p>
                <ul className="mt-1 space-y-1 text-sm text-muted">
                  {reqs.map((r) => <li key={r} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {r}</li>)}
                </ul>
              </div>
            )}
          </Card>

          <Card className="mt-4 p-5 text-sm">
            <h2 className="font-semibold">Contact & public information</h2>
            <div className="mt-3 space-y-2 text-muted">
              {agency.website && <a href={agency.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Globe className="h-4 w-4" /> Website</a>}
              {agency.contactEmail && <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {agency.contactEmail}</p>}
              {agency.contactPhone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {agency.contactPhone}</p>}
              <p className="pt-2 text-xs text-muted-2">Last verified: {monthYear(agency.lastVerifiedAt)}{agency.isDemo ? " · Demo data" : ""}</p>
            </div>
            <LiveCheck agencyId={agency.id} />
          </Card>

          {!agency.isDemo && (
            <Card className="mt-4 border-info/30 bg-info-soft/40 p-4 text-xs text-muted">
              <p className="font-semibold text-foreground">Public listing</p>
              <p className="mt-1">
                Listed from publicly available information (trust level 2 — publicly observable). CASTCHECK has
                <strong> not independently verified or endorsed</strong> this agency, and inclusion is not a
                recommendation. Always confirm details on the agency&rsquo;s official site and evaluate any
                representation offer yourself.
              </p>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Your match</h2>
              {match && <span className="text-2xl font-extrabold text-primary">{match.score}%</span>}
            </div>
            {match ? (
              <div className="mt-3 space-y-2">
                {match.rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{r.label}</span>
                    <Badge tone={r.tone}>{r.detail}</Badge>
                  </div>
                ))}
                <p className="border-t border-border pt-2 text-xs text-muted-2">
                  Match reflects career fit only. It never overrides a trust or fee warning.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link> and complete your
                profile to see your match to this agency.
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium" style={tone ? { color: `var(--${tone})` } : undefined}>{value}</dd>
    </div>
  );
}
