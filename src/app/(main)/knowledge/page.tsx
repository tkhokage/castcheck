import Link from "next/link";
import { db } from "@/lib/db";
import { Card, LinkButton } from "@/components/ui";
import { BookOpen, LifeBuoy, ArrowRight } from "lucide-react";

export const metadata = { title: "Knowledge base" };

export default async function KnowledgePage() {
  const articles = await db.knowledgeArticle.findMany({ orderBy: { category: "asc" } });
  const byCategory = articles.reduce<Record<string, typeof articles>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Knowledge base</h1>
          <p className="mt-1 text-muted">Guides for getting started, staying safe, and managing your account.</p>
        </div>
        <LinkButton href="/support" variant="outline"><LifeBuoy className="h-4 w-4" /> Support center</LinkButton>
      </div>

      <div className="mt-8 space-y-8">
        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((a) => (
                <Link key={a.id} href={`/knowledge/${a.slug}`}>
                  <Card className="group h-full p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                        <BookOpen className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="font-semibold group-hover:text-primary">{a.title}</p>
                        <p className="mt-0.5 text-sm text-muted">{a.summary}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-surface-2 p-6">
        <div>
          <p className="font-semibold">Still need help?</p>
          <p className="text-sm text-muted">Open a ticket and our support team will follow up.</p>
        </div>
        <LinkButton href="/support/new">Open a ticket <ArrowRight className="h-4 w-4" /></LinkButton>
      </Card>
    </div>
  );
}
