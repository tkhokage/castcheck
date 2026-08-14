import "server-only";

// Live source verification. The app fetches a listing's linked website at runtime
// and derives real evidence signals: does it resolve, does the contact email's
// domain match the site, and does the page mention the named entity?
//
// This is a first, honest step toward Phase 6. It uses the platform's own fetch
// (works today); a Firecrawl integration can later replace `fetchSite` for
// JS-heavy or anti-bot sites without changing the checks below.

export interface WebVerifyResult {
  input: string;
  normalizedUrl: string | null;
  reachable: boolean;
  status: number | null;
  finalUrl: string | null;
  siteDomain: string | null;
  emailDomain: string | null;
  domainMatch: "match" | "mismatch" | "unknown";
  mentionsEntity: boolean | null;
  verdict: "pass" | "warn" | "fail";
  notes: string[];
  checkedAt: string;
}

function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    return u.toString();
  } catch {
    return null;
  }
}

/** Registrable-ish domain: last two labels of the hostname (good enough for a demo). */
function registrableDomain(host: string | null): string | null {
  if (!host) return null;
  const h = host.replace(/^www\./i, "").toLowerCase();
  const parts = h.split(".");
  if (parts.length <= 2) return h;
  return parts.slice(-2).join(".");
}

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function fetchSite(url: string, timeoutMs = 8000): Promise<{ status: number; finalUrl: string; text: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CastcheckVerifier/1.0; +https://castcheck.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const text = (await res.text()).slice(0, 200_000);
    return { status: res.status, finalUrl: res.url || url, text };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyWebsite(input: {
  url?: string | null;
  contactEmail?: string | null;
  entityName?: string | null;
}): Promise<WebVerifyResult> {
  const checkedAt = new Date().toISOString();
  const normalizedUrl = normalizeUrl(input.url);
  const emailDomain = input.contactEmail?.includes("@")
    ? registrableDomain(input.contactEmail.split("@")[1])
    : null;

  const notes: string[] = [];

  if (!normalizedUrl) {
    notes.push("No official website was provided to check. Absence of a website is itself a caution.");
    return {
      input: input.url ?? "", normalizedUrl: null, reachable: false, status: null, finalUrl: null,
      siteDomain: null, emailDomain, domainMatch: "unknown", mentionsEntity: null,
      verdict: "fail", notes, checkedAt,
    };
  }

  const fetched = await fetchSite(normalizedUrl);
  if (!fetched || fetched.status >= 400) {
    notes.push(
      fetched ? `The website responded with HTTP ${fetched.status}.` : "The website did not respond (unreachable or blocked).",
    );
    notes.push("A listing whose 'official' site does not load is a strong warning sign — verify the organization elsewhere.");
    return {
      input: input.url ?? "", normalizedUrl, reachable: false, status: fetched?.status ?? null,
      finalUrl: fetched?.finalUrl ?? null, siteDomain: registrableDomain(hostOf(normalizedUrl)), emailDomain,
      domainMatch: "unknown", mentionsEntity: null, verdict: "fail", notes, checkedAt,
    };
  }

  const siteDomain = registrableDomain(hostOf(fetched.finalUrl));
  notes.push(`The website loaded (HTTP ${fetched.status}).`);

  let domainMatch: WebVerifyResult["domainMatch"] = "unknown";
  if (emailDomain && siteDomain) {
    domainMatch = emailDomain === siteDomain ? "match" : "mismatch";
    notes.push(
      domainMatch === "match"
        ? `The contact email domain (${emailDomain}) matches the website (${siteDomain}).`
        : `The contact email domain (${emailDomain}) does NOT match the website (${siteDomain}) — confirm this is intentional.`,
    );
  } else if (!emailDomain) {
    notes.push("No contact email domain to compare against the website.");
  }

  let mentionsEntity: boolean | null = null;
  if (input.entityName) {
    const needle = input.entityName.toLowerCase().replace(/\b(llc|inc|ltd|casting|agency|productions?|pictures|media)\b/gi, "").trim();
    const words = needle.split(/\s+/).filter((w) => w.length >= 3);
    mentionsEntity = words.length > 0 && words.every((w) => fetched.text.toLowerCase().includes(w));
    notes.push(mentionsEntity ? "The page appears to reference the named entity." : "The page does not clearly reference the named entity — confirm it's the right site.");
  }

  // Verdict
  let verdict: WebVerifyResult["verdict"] = "warn";
  if (domainMatch === "match" || mentionsEntity === true) verdict = "pass";
  if (domainMatch === "mismatch") verdict = "warn";

  return {
    input: input.url ?? "", normalizedUrl, reachable: true, status: fetched.status, finalUrl: fetched.finalUrl,
    siteDomain, emailDomain, domainMatch, mentionsEntity, verdict, notes, checkedAt,
  };
}
