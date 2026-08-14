"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { verifyWebsite, type WebVerifyResult } from "@/lib/verify-web";
import { audit } from "@/lib/audit";

// Runs a LIVE website check against a listing's own stored source URL.
// The URL comes from our database (poster/moderator controlled), never from the
// caller — so this can't be turned into an open web-fetch proxy.
export async function checkOpportunityWebsite(
  opportunityId: string,
): Promise<{ result?: WebVerifyResult; error?: string }> {
  const session = await getSession();

  const key = `livecheck:${session?.id ?? "anon"}`;
  const limit = rateLimit(key, 10, 60_000);
  if (!limit.ok) return { error: `Slow down — try again in ${limit.retryAfterSec}s.` };

  const opp = await db.opportunity.findUnique({
    where: { id: opportunityId },
    select: { sourceUrl: true, contactEmail: true, productionCompany: true, castingEntity: true },
  });
  if (!opp) return { error: "Listing not found." };

  const result = await verifyWebsite({
    url: opp.sourceUrl,
    contactEmail: opp.contactEmail,
    entityName: opp.productionCompany || opp.castingEntity,
  });

  await audit({ userId: session?.id, action: "opportunity.livecheck", resource: `opportunity:${opportunityId}`, meta: { verdict: result.verdict } });
  return { result };
}

// Same idea for an agency's own stored website.
export async function checkAgencyWebsite(
  agencyId: string,
): Promise<{ result?: WebVerifyResult; error?: string }> {
  const session = await getSession();

  const limit = rateLimit(`livecheck:${session?.id ?? "anon"}`, 10, 60_000);
  if (!limit.ok) return { error: `Slow down — try again in ${limit.retryAfterSec}s.` };

  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: { website: true, contactEmail: true, name: true },
  });
  if (!agency) return { error: "Agency not found." };

  const result = await verifyWebsite({
    url: agency.website,
    contactEmail: agency.contactEmail,
    entityName: agency.name,
  });

  await audit({ userId: session?.id, action: "agency.livecheck", resource: `agency:${agencyId}`, meta: { verdict: result.verdict } });
  return { result };
}
