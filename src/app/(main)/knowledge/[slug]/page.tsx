import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, Badge, LinkButton } from "@/components/ui";
import { FurtherReading } from "@/components/further-reading";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: PageProps<"/knowledge/[slug]">) {
  const { slug } = await params;
  const article = await db.knowledgeArticle.findUnique({ where: { slug } });
  return { title: article?.title ?? "Article" };
}

export default async function ArticlePage({ params }: PageProps<"/knowledge/[slug]">) {
  const { slug } = await params;
  const article = await db.knowledgeArticle.findUnique({ where: { slug } });
  if (!article) notFound();

  const related = await db.knowledgeArticle.findMany({
    where: { category: article.category, slug: { not: slug } },
    take: 3,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/knowledge" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Knowledge base
      </Link>

      <Badge tone="neutral">{article.category}</Badge>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{article.title}</h1>
      <p className="mt-2 text-lg text-muted">{article.summary}</p>

      <Card className="mt-6 p-6">
        <p className="whitespace-pre-line leading-relaxed">{article.body}</p>
      </Card>

      <FurtherReading />

      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Related</h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/knowledge/${r.slug}`} className="text-primary hover:underline">{r.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Card className="mt-8 flex items-center justify-between gap-4 bg-surface-2 p-5">
        <p className="text-sm text-muted">Didn&rsquo;t solve it?</p>
        <LinkButton href="/support/new" variant="outline">Open a ticket</LinkButton>
      </Card>
    </div>
  );
}
