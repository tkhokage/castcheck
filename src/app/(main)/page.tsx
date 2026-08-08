import Link from "next/link";
import { db } from "@/lib/db";
import { LinkButton, Card, Badge } from "@/components/ui";
import { OpportunityCard } from "@/components/opportunity-card";
import {
  Search, ShieldCheck, Target, Send, ListChecks, AlertTriangle, ArrowRight, Sparkles,
} from "lucide-react";

const PIPELINE = [
  { icon: Search, title: "Discover", text: "Find film, TV, theater, commercial, indie, student, and voice opportunities across your market." },
  { icon: ShieldCheck, title: "Verify", text: "Every listing is checked against evidence. We never hide uncertainty." },
  { icon: Target, title: "Evaluate", text: "See career fit and residual risk — separately, so a good fit never masks a red flag." },
  { icon: Send, title: "Apply", text: "Submit through legitimate methods, with guidance on what to share and what to withhold." },
  { icon: ListChecks, title: "Track", text: "Follow every submission from saved to booked in one tracker." },
];

export default async function LandingPage() {
  const featured = await db.opportunity.findMany({
    where: { status: "published", verificationState: { in: ["verified", "partial"] } },
    include: { checks: { select: { status: true } } },
    orderBy: { lastVerifiedAt: "desc" },
    take: 3,
  });

  const [oppCount, verifiedCount, agencyCount] = await Promise.all([
    db.opportunity.count(),
    db.opportunity.count({ where: { verificationState: "verified" } }),
    db.agency.count(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="hero-grid border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <Badge tone="primary" className="mx-auto">
            <Sparkles className="h-3.5 w-3.5" /> For emerging actors
          </Badge>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Find real auditions. <span className="text-primary">Avoid the scams.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            CASTCHECK is a trust-first hub for casting calls, indie and student film auditions, and talent-agency
            discovery — with evidence-based verification and risk checks on every listing.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/register" className="px-6 py-3 text-base">
              Get started free <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/discover" variant="outline" className="px-6 py-3 text-base">
              Browse opportunities
            </LinkButton>
          </div>
          <p className="mt-6 text-sm font-semibold tracking-wide text-muted">
            Find it. Verify it. Pursue it.
          </p>

          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
            <Stat n={oppCount} label="Opportunities" />
            <Stat n={verifiedCount} label="Verified" />
            <Stat n={agencyCount} label="Agencies" />
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">A pipeline, not a bulletin board</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted">
            Other boards just list calls. CASTCHECK walks each one through the same disciplined path.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {PIPELINE.map((p, i) => (
            <Card key={p.title} className="relative p-5">
              <span className="absolute right-4 top-4 font-mono text-xs text-muted-2">0{i + 1}</span>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust callout */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2">
          <div>
            <Badge tone="danger">
              <AlertTriangle className="h-3.5 w-3.5" /> Scam-aware by design
            </Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
              We flag the red flags actors miss
            </h2>
            <p className="mt-3 text-muted">
              Upfront fees, gift-card payments, guaranteed roles, off-platform DMs, and requests for your SSN
              or banking details are classic warning signs. CASTCHECK surfaces them plainly — and explains why.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {["Pay-to-audition and mandatory package fees", "Requests for SSN, ID, or banking up front", "Guaranteed employment or representation", "Unverifiable companies and domain mismatches"].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <LinkButton href="/knowledge/information-to-avoid-sharing" variant="outline" className="mt-6">
              What to never share
            </LinkButton>
          </div>
          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Example — flagged listing</p>
            <h3 className="mt-2 font-semibold">&ldquo;Netflix Feature&rdquo; — Leads Needed, Apply Fast!!</h3>
            <div className="mt-4 space-y-2 text-sm">
              {[
                ["Production company", "No identifiable company"],
                ["Casting contact", "Free email + Telegram only"],
                ["Submission method", "Off-platform DM"],
                ["Compensation", "Unrealistic guaranteed pay"],
                ["Personal info", "Home address requested up front"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 border-b border-border pb-1.5">
                  <span className="text-muted">{k}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-danger">✕ {v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              Inherent risk: <strong>Critical</strong> (25/25). Requests a gift-card fee before any audition.
            </div>
          </Card>
        </div>
      </section>

      {/* Featured opportunities */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Recently verified</h2>
            <p className="mt-1 text-muted">A sample of opportunities that passed our checks.</p>
          </div>
          <Link href="/discover" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((o) => (
            <OpportunityCard key={o.id} opp={o} />
          ))}
        </div>
      </section>

      {/* Agency CTA */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Looking for representation?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted">
            Search talent agencies by region and specialty, and get match scores based on your acting resume and
            career goals — with the same trust lens.
          </p>
          <LinkButton href="/agencies" className="mt-6">
            Explore agencies <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="text-3xl font-extrabold tabular-nums text-primary">{n}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
