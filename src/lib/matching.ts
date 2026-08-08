// Career-fit and agency matching (spec §10, §12).
// Deterministic, explainable scoring. Career fit NEVER overrides a risk warning —
// that separation is enforced in the UI, not here.

import { asList } from "./utils";

type ProfileLike = {
  location?: string | null;
  experienceLevel?: string | null;
  preferredMediums?: unknown;
  desiredMarkets?: unknown;
  roleTypes?: unknown;
  compensationPref?: string | null;
  productionTypePref?: unknown;
  willingToTravel?: boolean | null;
} | null | undefined;

type OppLike = {
  type: string;
  location: string;
  roleType: string;
  compensation: string;
  productionType?: string | null;
  experienceLevel?: string | null;
};

export interface FitBreakdown {
  score: number; // 0..100
  rows: { label: string; rating: string; tone: string }[];
}

function rate(score: number): { rating: string; tone: string } {
  if (score >= 85) return { rating: "Excellent", tone: "success" };
  if (score >= 65) return { rating: "Strong", tone: "success" };
  if (score >= 45) return { rating: "Moderate", tone: "warning" };
  return { rating: "Low", tone: "neutral" };
}

const MEDIUM_MAP: Record<string, string[]> = {
  film: ["film", "indie", "short", "student"],
  television: ["television", "web series"],
  theater: ["theater"],
  commercial: ["commercial"],
  voice: ["voice"],
};

export function careerFit(profile: ProfileLike, opp: OppLike): FitBreakdown {
  if (!profile) {
    return { score: 0, rows: [{ label: "Complete your profile to see fit", rating: "—", tone: "neutral" }] };
  }

  const mediums = asList(profile.preferredMediums).map(String);
  const markets = asList(profile.desiredMarkets).map(String);
  const roles = asList(profile.roleTypes).map(String);
  const prodPrefs = asList(profile.productionTypePref).map(String);

  const rows: { label: string; rating: string; tone: string }[] = [];
  const parts: number[] = [];

  // Medium match
  let mediumScore = 40;
  for (const m of mediums) {
    if (MEDIUM_MAP[m]?.includes(opp.type) || m === opp.type) mediumScore = 95;
  }
  parts.push(mediumScore);
  rows.push({ label: "Medium match", ...rate(mediumScore) });

  // Market / location match
  let marketScore = 45;
  if (markets.includes(opp.location)) marketScore = 95;
  else if (opp.location === "Remote" || opp.location === "Nationwide") marketScore = 80;
  else if (profile.willingToTravel) marketScore = 70;
  else if (profile.location && opp.location.includes(profile.location.split(",")[0])) marketScore = 85;
  parts.push(marketScore);
  rows.push({ label: "Market match", ...rate(marketScore) });

  // Role match
  let roleScore = roles.length ? 45 : 60;
  if (roles.includes(opp.roleType)) roleScore = 92;
  parts.push(roleScore);
  rows.push({ label: "Role match", ...rate(roleScore) });

  // Experience match
  let expScore = 70;
  if (profile.experienceLevel && opp.experienceLevel) {
    expScore = profile.experienceLevel === opp.experienceLevel ? 92 : 62;
  }
  parts.push(expScore);
  rows.push({ label: "Experience match", ...rate(expScore) });

  // Compensation alignment
  let compScore = 65;
  if (profile.compensationPref === "paid") {
    compScore = opp.compensation === "paid" ? 95 : opp.compensation === "deferred" ? 55 : 35;
  } else {
    compScore = 80;
  }
  parts.push(compScore);
  rows.push({ label: "Compensation fit", ...rate(compScore) });

  // Production type
  if (prodPrefs.length && opp.productionType) {
    const pScore = prodPrefs.includes(opp.productionType) ? 90 : 55;
    parts.push(pScore);
    rows.push({ label: "Production type", ...rate(pScore) });
  }

  const score = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  return { score, rows };
}

// ---------------------------------------------------------------------------
// Agency matching
// ---------------------------------------------------------------------------

type AgencyLike = {
  location: string;
  marketsServed?: unknown;
  representationSpecialties?: unknown;
  careerLevel?: unknown;
};

export interface AgencyMatch {
  score: number; // 0..100
  rows: { label: string; detail: string; tone: string }[];
}

export function agencyMatch(profile: ProfileLike, agency: AgencyLike): AgencyMatch {
  if (!profile) {
    return { score: 0, rows: [{ label: "Profile", detail: "Complete your profile", tone: "neutral" }] };
  }
  const mediums = asList(profile.preferredMediums).map(String);
  const markets = asList(profile.desiredMarkets).map(String);
  const specialties = asList(agency.representationSpecialties).map(String);
  const agMarkets = asList(agency.marketsServed).map(String);
  const agLevels = asList(agency.careerLevel).map(String);

  const rows: { label: string; detail: string; tone: string }[] = [];
  const parts: number[] = [];

  // Representation vs actor interests
  const wantsFilmTv = mediums.some((m) => ["film", "television", "indie", "short", "student", "web series"].includes(m));
  const filmTvMatch = specialties.includes("film/tv");
  const filmScore = wantsFilmTv ? (filmTvMatch ? 95 : 40) : 65;
  parts.push(filmScore);
  rows.push({ label: "Film/TV", detail: filmTvMatch ? "Represents" : "Limited", tone: filmScore >= 65 ? "success" : "neutral" });

  const commMatch = specialties.includes("commercial");
  const commScore = mediums.includes("commercial") ? (commMatch ? 90 : 45) : 60;
  parts.push(commScore);
  rows.push({ label: "Commercial", detail: commMatch ? "Represents" : "Limited", tone: commScore >= 65 ? "success" : "neutral" });

  const theaterMatch = specialties.includes("theater");
  const theaterScore = mediums.includes("theater") ? (theaterMatch ? 90 : 40) : 55;
  parts.push(theaterScore);
  rows.push({ label: "Theater", detail: theaterMatch ? "Represents" : "Limited", tone: theaterScore >= 65 ? "success" : "neutral" });

  // Market
  const marketMatch = markets.some((m) => agMarkets.includes(m)) || agMarkets.includes(agency.location);
  const marketScore = marketMatch ? 95 : 40;
  parts.push(marketScore);
  rows.push({ label: "Market", detail: marketMatch ? "Serves your market" : "Different market", tone: marketMatch ? "success" : "neutral" });

  // Career level
  const levelMatch = !profile.experienceLevel || agLevels.length === 0 || agLevels.includes(profile.experienceLevel);
  const levelScore = levelMatch ? 90 : 50;
  parts.push(levelScore);
  rows.push({ label: "Career level", detail: levelMatch ? "Good stage fit" : "May prefer other stage", tone: levelMatch ? "success" : "warning" });

  const score = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  return { score, rows };
}
