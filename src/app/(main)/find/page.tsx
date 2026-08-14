import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CASTING_SOURCES } from "@/lib/sources";
import { Card, Badge, LinkButton } from "@/components/ui";
import { asList } from "@/lib/utils";
import { ExternalLink, Upload, ShieldCheck, Compass, Film, Building2 } from "lucide-react";

export const metadata = { title: "Find casting calls" };

export default async function FindPage() {
  const user = await getCurrentUser();
  const market = user?.profile ? asList(user.profile.desiredMarkets).map(String)[0] : undefined;
  const medium = user?.profile ? asList(user.profile.preferredMediums).map(String)[0] : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Find casting calls</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Browse CASTCHECK&rsquo;s own verified listings, jump to the big casting sites, or import a call you found
        anywhere to verify and track it here.
      </p>

      {/* Two clear CASTCHECK sections */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/discover">
          <Card className="flex h-full items-start gap-3 p-5 hover:shadow-md">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><Film className="h-5 w-5" /></span>
            <div>
              <p className="font-semibold">Casting calls on CASTCHECK</p>
              <p className="mt-0.5 text-sm text-muted">Verified film, TV, theater, commercial, indie & student roles.</p>
            </div>
          </Card>
        </Link>
        <Link href="/agencies">
          <Card className="flex h-full items-start gap-3 p-5 hover:shadow-md">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Building2 className="h-5 w-5" /></span>
            <div>
              <p className="font-semibold">Talent agencies on CASTCHECK</p>
              <p className="mt-0.5 text-sm text-muted">Representation — a different thing from a casting call.</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* External sources */}
      <div className="mt-10 flex items-center gap-2">
        <Compass className="h-5 w-5 text-muted" />
        <h2 className="text-xl font-bold tracking-tight">Jump to the major casting sites</h2>
      </div>
      <p className="mt-1 text-sm text-muted">
        These are the industry&rsquo;s main sources. You browse and sign in <strong>on their own sites</strong> —
        CASTCHECK doesn&rsquo;t scrape them or store your logins for them. Found something? Import it below.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {CASTING_SOURCES.map((s) => {
          const href = s.search ? s.search({ type: medium, location: market }) : s.url;
          return (
            <Card key={s.id} className="flex flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{s.name}</p>
                {s.search && (market || medium) && <Badge tone="primary">Pre-filled for you</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted">{s.blurb}</p>
              <p className="mt-2 text-xs text-muted-2">{s.access}</p>
              <a
                href={href}
                target="_blank"
                rel="noreferrer nofollow"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Open {s.name} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Card>
          );
        })}
      </div>

      {/* Import CTA */}
      <Card className="mt-10 flex flex-wrap items-center justify-between gap-4 border-primary/20 bg-primary-soft/40 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">Found a call? Import it to verify & track.</p>
            <p className="mt-0.5 max-w-xl text-sm text-muted">
              Paste any listing (from the sites above or anywhere) and CASTCHECK runs its scam screening, live
              website check, risk score, and career-fit — then adds it to your tracker. Private to you.
            </p>
          </div>
        </div>
        <LinkButton href="/find/import"><Upload className="h-4 w-4" /> Import a listing</LinkButton>
      </Card>
    </div>
  );
}
