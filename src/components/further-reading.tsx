import { Card } from "./ui";
import { ExternalLink, ShieldCheck } from "lucide-react";

// Real, authoritative outbound sources — consistent with CASTCHECK's evidence-based
// positioning and the source-priority list in docs/roadmap.md (government →
// industry organizations → business registries).
const SOURCES: { label: string; note: string; url: string }[] = [
  {
    label: "FTC — Modeling and acting scams",
    note: "How the U.S. Federal Trade Commission describes casting/modeling scams and how to avoid them.",
    url: "https://consumer.ftc.gov/articles/modeling-acting-scams",
  },
  {
    label: "FTC — Report fraud",
    note: "Report a scam or suspicious casting call to the FTC.",
    url: "https://reportfraud.ftc.gov/",
  },
  {
    label: "SAG-AFTRA",
    note: "The performers' union — franchised agents, standards, and member resources.",
    url: "https://www.sagaftra.org/",
  },
  {
    label: "Better Business Bureau",
    note: "Look up an agency or company and check complaints before you engage.",
    url: "https://www.bbb.org/",
  },
];

export function FurtherReading() {
  return (
    <Card className="mt-8 p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <ShieldCheck className="h-4 w-4 text-primary" /> Verify independently — authoritative sources
      </h2>
      <p className="mt-1 text-sm text-muted">
        Don&rsquo;t take our word for it. Cross-check with these independent, authoritative sources.
      </p>
      <ul className="mt-4 space-y-3">
        {SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer nofollow" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              {s.label} <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="text-sm text-muted">{s.note}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
