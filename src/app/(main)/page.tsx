import Link from "next/link";
import { ActorLanding } from "@/components/actor-landing";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { OpportunityCard } from "@/components/opportunity-card";
import { Card, LinkButton, EmptyState, inputClass } from "@/components/ui";
import { Search, ArrowUpRight, ShieldCheck, Bookmark, Clapperboard, Building2 } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return <ActorLanding />;
  const current = { status: "published", isDemo: false, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] };
  const [opportunities, count, agencies, applications] = await Promise.all([
    db.opportunity.findMany({ where: current, include: { checks: { select: { status: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
    db.opportunity.count({ where: current }),
    db.agency.count({ where: { isDemo: false } }),
    user ? db.application.count({ where: { userId: user.id } }) : Promise.resolve(0),
  ]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Your casting workspace</p>
        <Link href="/find/import" className="text-sm font-semibold text-primary">Import a call <ArrowUpRight className="inline h-4 w-4" /></Link>
      </div>
      <section className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">Make room for<br /><span className="text-primary">your next role.</span></h1>
          <p className="mt-5 max-w-xl text-lg text-muted">Find a call. Understand the evidence. Keep your next move in one place.</p>
          <form action="/discover" className="mt-7 flex gap-2" role="search">
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search casting calls</span><Search className="absolute left-4 top-4 h-5 w-5 text-muted" /><input name="q" placeholder="Role, production, or company" className={`${inputClass} h-14 pl-12 text-base`} /></label>
            <button className="rounded-lg bg-primary px-5 font-semibold text-primary-fg hover:bg-primary-hover">Search</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {["Dallas", "Austin", "Los Angeles", "New York", "Remote"].map(market => <Link key={market} href={`/discover?location=${encodeURIComponent(market)}`} className="rounded-full border border-border bg-surface px-4 py-2 hover:border-primary">{market}</Link>)}
          </div>
        </div>
        <Card className="flex flex-col justify-between overflow-hidden p-6 sm:p-8">
          <div><span className="text-sm font-semibold uppercase tracking-wider text-muted">Your next steps</span><h2 className="mt-3 text-2xl font-semibold">A little more clarity.<br />A lot less tab switching.</h2></div>
          <div className="mt-6 divide-y divide-border">
            {[
              { href: "/discover", icon: Clapperboard, label: "Explore casting calls", detail: `${count} non-demo calls without a closed deadline` },
              { href: "/agencies", icon: Building2, label: "Find representation", detail: `${agencies} agency records · list or 3D district` },
              { href: "/tracker", icon: Bookmark, label: "Keep applications moving", detail: user ? `${applications} in your tracker` : "Save your progress when you sign in" },
            ].map(item => <Link key={item.href} href={item.href} className="flex items-center gap-3 py-4 last:pb-0"><item.icon className="h-5 w-5 shrink-0 text-primary" /><span className="flex-1"><span className="block font-semibold">{item.label}</span><span className="mt-1 block text-sm text-muted">{item.detail}</span></span><ArrowUpRight className="h-4 w-4" /></Link>)}
          </div>
        </Card>
      </section>
      <section className="mt-12 border-t border-border pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-semibold tracking-tight">Latest casting calls</h2><p className="mt-2 text-muted">Review each source before you apply. Unknown deadlines may still be closed.</p></div><Link href="/discover" className="font-semibold text-primary">View all calls ↗</Link></div>
        {opportunities.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{opportunities.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}</div> : <Card className="p-6"><EmptyState title="No current non-demo calls in this collection" hint="Browse source websites or import a call to review and track it. Sample listings are available separately." /><div className="flex flex-wrap justify-center gap-3"><LinkButton href="/find">Browse source websites</LinkButton><LinkButton href="/discover?demo=1" variant="outline">Explore sample listings</LinkButton></div></Card>}
      </section>
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-border px-5 py-4 text-sm text-muted"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><p><strong className="text-foreground">Evidence comes first.</strong> Website checks, risk indicators, and career fit answer different questions. None guarantees a role or proves a listing is safe. <Link href="/knowledge/how-verification-works" className="text-primary underline">How checks work</Link></p></div>
    </div>
  );
}
