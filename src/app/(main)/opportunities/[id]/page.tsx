import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";
import { Card, Badge, LinkButton } from "@/components/ui";
import { VerificationBadge, RiskBadge, TrustLevelBadge } from "@/components/badges";
import { SaveButton, TrackButton, ReportDialog } from "@/components/opportunity-actions";
import { LiveCheck } from "@/components/live-check";
import { CHECK_STATUS_ICON, LIKELIHOOD_LABELS, IMPACT_LABELS, riskScore } from "@/lib/risk";
import { careerFit } from "@/lib/matching";
import { riskNarrative, fitNarrative, aiEnabled } from "@/lib/ai";
import { RISK_CATEGORIES } from "@/lib/constants";
import { asList, formatDate, monthYear } from "@/lib/utils";
import {
  MapPin, DollarSign, Calendar, Building2, User, Send, ArrowLeft, ShieldAlert, Sparkles, Info,
  Globe, Mail, Phone, SearchCheck,
} from "lucide-react";

export default async function OpportunityDetail({ params }: PageProps<"/opportunities/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();

  const opp = await db.opportunity.findUnique({
    where: { id },
    include: {
      checks: true,
      riskIndicators: true,
      saved: user ? { where: { userId: user.id } } : false,
      applications: user ? { where: { userId: user.id } } : false,
    },
  });
  if (!opp) notFound();

  // Imported listings are private to the person who imported them (staff can also see).
  if (opp.status === "imported" && opp.createdById !== user?.id && !isStaff(user?.role)) {
    notFound();
  }

  const profile = user?.profile ?? null;
  const fit = profile
    ? careerFit(profile, {
        type: opp.type, location: opp.location, roleType: opp.roleType,
        compensation: opp.compensation, productionType: opp.productionType, experienceLevel: opp.experienceLevel,
      })
    : null;

  const risk = await riskNarrative({
    title: opp.title,
    level: opp.riskLevel,
    indicators: opp.riskIndicators.map((i) => ({ category: i.category, description: i.description, severity: i.severity })),
  });
  const fitNote = fit ? await fitNarrative({ score: fit.score, rows: fit.rows, oppTitle: opp.title }) : null;

  const requirements = asList(opp.submissionRequirements);
  const saved = Array.isArray(opp.saved) && opp.saved.length > 0;
  const tracking = Array.isArray(opp.applications) && opp.applications.length > 0;
  const dangerous = ["flagged", "high_risk", "rejected"].includes(opp.verificationState);
  const asksPersonalInfo = opp.checks.some((c) => c.key === "personal_info" && c.status !== "pass");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/discover" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Discover
      </Link>

      {dangerous && (
        <div className="mb-6 flex items-start gap-3 rounded-[var(--radius)] border border-danger/40 bg-danger-soft p-4 text-danger">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">This listing raised serious warning signs.</p>
            <p className="text-sm">Review the risk indicators below before taking any action. Never send money or sensitive personal information to an unverified opportunity.</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{opp.type}</Badge>
            <VerificationBadge state={opp.verificationState} />
            <RiskBadge level={opp.riskLevel} />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{opp.title}</h1>
          <p className="mt-1 text-lg text-muted">{opp.role}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Detail icon={Building2} label="Production" value={opp.production} />
            <Detail icon={Building2} label="Production company" value={opp.productionCompany} />
            <Detail icon={User} label="Casting entity" value={opp.castingEntity} />
            <Detail icon={MapPin} label="Location" value={opp.location} />
            <Detail icon={DollarSign} label="Compensation" value={opp.payDetails ?? opp.compensation} />
            <Detail icon={Calendar} label="Deadline" value={formatDate(opp.deadline)} />
            <Detail icon={Info} label="Union status" value={opp.unionStatus} />
            <Detail icon={Send} label="Submission" value={opp.submissionMethod} />
          </div>

          {opp.description && (
            <Card className="mt-6 p-5">
              <h2 className="font-semibold">About this opportunity</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">{opp.description}</p>
            </Card>
          )}

          {requirements.length > 0 && (
            <Card className="mt-4 p-5">
              <h2 className="font-semibold">Submission requirements</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {requirements.map((r) => (
                  <li key={String(r)} className="flex items-center gap-2 text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {String(r)}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Verification checks */}
          <Card className="mt-6 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Verification checks</h2>
              <TrustLevelBadge level={opp.trustLevel} />
            </div>
            <p className="mt-1 text-sm text-muted">Each check is shown individually. We never hide uncertainty.</p>
            <div className="mt-4 divide-y divide-border">
              {opp.checks.map((c) => {
                const s = CHECK_STATUS_ICON[c.status] ?? CHECK_STATUS_ICON.pending;
                return (
                  <div key={c.id} className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      {c.note && <p className="mt-0.5 text-sm text-muted">{c.note}</p>}
                    </div>
                    <Badge tone={s.tone} className="shrink-0">
                      <span aria-hidden>{s.icon}</span> {s.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Risk assessment */}
          <Card className="mt-6 p-5">
            <h2 className="font-semibold">Risk assessment</h2>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <RiskMatrixCell likelihood={opp.riskLikelihood} impact={opp.riskImpact} level={opp.riskLevel} />
              <div className="text-sm">
                <p><span className="text-muted">Likelihood:</span> {LIKELIHOOD_LABELS[opp.riskLikelihood]} ({opp.riskLikelihood}/5)</p>
                <p><span className="text-muted">Impact:</span> {IMPACT_LABELS[opp.riskImpact]} ({opp.riskImpact}/5)</p>
                <p><span className="text-muted">Inherent risk:</span> {riskScore(opp.riskLikelihood, opp.riskImpact)}/25</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-surface-2 p-3 text-sm">
              <div className="mb-1 flex items-center gap-1.5 font-medium">
                {aiEnabled() ? <Sparkles className="h-3.5 w-3.5 text-primary" /> : <Info className="h-3.5 w-3.5 text-muted" />}
                Summary
                <Badge tone={risk.source === "ai" ? "primary" : "neutral"} className="ml-1">
                  {risk.source === "ai" ? "AI-assisted" : "Rule-based"} · {risk.confidence} confidence
                </Badge>
              </div>
              <p className="text-muted">{risk.data.summary}</p>
              <p className="mt-1 text-xs text-muted-2">{risk.note}</p>
            </div>

            {opp.riskIndicators.length > 0 && (
              <div className="mt-4 space-y-2">
                {opp.riskIndicators.map((i) => (
                  <div key={i.id} className="flex items-start gap-2 text-sm">
                    <Badge tone={i.severity === "high" ? "danger" : i.severity === "medium" ? "warning" : "neutral"} className="shrink-0">
                      {RISK_CATEGORIES[i.category as keyof typeof RISK_CATEGORIES] ?? i.category}
                    </Badge>
                    <span className="text-muted">{i.description}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {asksPersonalInfo && (
            <Card className="mt-4 border-warning/40 bg-warning-soft p-4 text-sm text-warning">
              <p className="font-semibold">A note on the information requested</p>
              <p className="mt-1">
                This opportunity&rsquo;s personal-information request needs confirmation. Consider verifying the
                organization independently before providing sensitive details. CASTCHECK never asks you to share
                your SSN, government ID, or banking information.
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <div className="flex flex-col gap-2">
              <TrackButton id={opp.id} tracking={tracking} signedIn={!!user} />
              <SaveButton id={opp.id} saved={saved} signedIn={!!user} />
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <ReportDialog id={opp.id} />
            </div>
          </Card>

          {/* Career fit */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Career fit</h2>
              {fit && <span className="text-2xl font-extrabold text-primary">{fit.score}</span>}
            </div>
            {fit ? (
              <>
                <p className="text-xs text-muted">Separate from risk — a good fit never hides a warning.</p>
                <div className="mt-3 space-y-2">
                  {fit.rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{r.label}</span>
                      <Badge tone={r.tone}>{r.rating}</Badge>
                    </div>
                  ))}
                </div>
                {fitNote && <p className="mt-3 border-t border-border pt-3 text-xs text-muted">{fitNote.data.summary}</p>}
              </>
            ) : (
              <div className="mt-2 text-sm text-muted">
                <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link> and complete your
                profile to see how this matches your resume and goals.
              </div>
            )}
          </Card>

          {/* Source & contact */}
          <Card className="p-5 text-sm">
            <h2 className="font-semibold">Source & contact</h2>
            <p className="mt-2 text-muted">Source: {opp.source ?? "—"}</p>
            <p className="text-muted">Last verified: {monthYear(opp.lastVerifiedAt)}</p>

            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              {opp.sourceUrl ? (
                <a href={opp.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium text-primary hover:underline">
                  <Globe className="h-4 w-4 shrink-0" /> Official website
                </a>
              ) : (
                <p className="flex items-center gap-2 text-muted"><Globe className="h-4 w-4 shrink-0" /> No website listed</p>
              )}
              {opp.contactName && <p className="flex items-center gap-2 text-muted"><User className="h-4 w-4 shrink-0" /> {opp.contactName}</p>}
              {opp.contactEmail && (
                <a href={`mailto:${opp.contactEmail}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="h-4 w-4 shrink-0" /> {opp.contactEmail}
                </a>
              )}
              {opp.contactPhone && (
                <a href={`tel:${opp.contactPhone}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-4 w-4 shrink-0" /> {opp.contactPhone}
                </a>
              )}
              {!opp.contactEmail && !opp.contactPhone && <p className="flex items-center gap-2 text-muted"><Mail className="h-4 w-4 shrink-0" /> No contact listed</p>}
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-2 p-2.5 text-xs text-muted">
              <SearchCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="font-medium text-foreground">Verify before you share.</span> Search the production
                company and casting entity independently, confirm the website domain matches, and never send money,
                your SSN, ID, or banking details to confirm a role.
              </span>
            </div>

            <LiveCheck opportunityId={opp.id} />

            {opp.isDemo && <Badge tone="neutral" className="mt-3">Demo data — example contacts</Badge>}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function RiskMatrixCell({ likelihood, impact, level }: { likelihood: number; impact: number; level: string }) {
  const tone = level === "low" ? "success" : level === "moderate" ? "warning" : "danger";
  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border-2" style={{ borderColor: `var(--${tone})`, background: `var(--${tone}-soft)` }}>
      <div className="text-center">
        <div className="text-2xl font-extrabold" style={{ color: `var(--${tone})` }}>{likelihood * impact}</div>
        <div className="text-[10px] font-medium uppercase" style={{ color: `var(--${tone})` }}>{level}</div>
      </div>
    </div>
  );
}
