import { createHash } from "node:crypto";

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export interface ListingPreview {
  title: string;
  description: string;
  sourceUrl: string;
  finalUrl: string;
  fetchedAt: string;
  contentHash: string;
  extraction: "structured" | "page_metadata";
  deadline: string | null;
}

// Extract only source-authored fields. No generated role, pay or trust claims.
export function extractListing(html: string, sourceUrl: string, finalUrl: string): ListingPreview {
  const jobs: Record<string, unknown>[] = [];
  function visit(value: unknown, depth = 0) {
    if (depth > 8 || !value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.slice(0, 100).forEach(item => visit(item, depth + 1)); return; }
    const obj = value as Record<string, unknown>;
    const types = Array.isArray(obj["@type"]) ? obj["@type"] : [obj["@type"]];
    if (types.includes("JobPosting")) jobs.push(obj);
    if (obj["@graph"]) visit(obj["@graph"], depth + 1);
  }
  for (const script of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(script[1])); } catch { /* malformed source data is ignored */ }
  }
  // Multiple jobs indicate a collection page: do not select an arbitrary role.
  const job = jobs.length === 1 ? jobs[0] : undefined;
  const pageTitle = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].find(match => /(?:name|property)\s*=\s*["'](?:description|og:description)["']/i.test(match[0]));
  const pageDescription = meta?.[0].match(/content\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] || "";
  const rawDeadline = job?.validThrough;
  const deadline = typeof rawDeadline === "string" && /^\d{4}-\d{2}-\d{2}/.test(rawDeadline) && Number.isFinite(Date.parse(rawDeadline)) ? new Date(rawDeadline).toISOString() : null;
  return {
    title: text(job?.title || pageTitle, 300), description: text(job?.description || pageDescription, 15000),
    sourceUrl, finalUrl, fetchedAt: new Date().toISOString(),
    contentHash: createHash("sha256").update(html).digest("hex"),
    extraction: job ? "structured" : "page_metadata", deadline,
  };
}
