// Risk scoring + verification derivation (spec §13–14, §4–6).

export function riskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

export function riskLevel(score: number): "low" | "moderate" | "high" | "critical" {
  if (score <= 4) return "low";
  if (score <= 9) return "moderate";
  if (score <= 16) return "high";
  return "critical";
}

export const RISK_LEVEL_TONE: Record<string, string> = {
  low: "success",
  moderate: "warning",
  high: "danger",
  critical: "danger",
};

export const LIKELIHOOD_LABELS = ["", "Rare", "Unlikely", "Possible", "Likely", "Almost certain"];
export const IMPACT_LABELS = ["", "Minimal", "Minor", "Moderate", "Major", "Severe"];

/**
 * Derive an overall verification state from individual checks.
 * Never labels "verified" unless the requirements are actually met.
 */
export function deriveVerificationState(
  checks: { status: string }[],
  hasHighRiskIndicators = false,
): { state: string; passed: number; total: number } {
  const total = checks.length;
  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;

  if (hasHighRiskIndicators || failed >= 2) return { state: "high_risk", passed, total };
  if (failed >= 1) return { state: "flagged", passed, total };
  if (total > 0 && passed === total) return { state: "verified", passed, total };
  if (passed >= Math.ceil(total / 2)) return { state: "partial", passed, total };
  return { state: "needs_review", passed, total };
}

export const CHECK_STATUS_ICON: Record<string, { icon: string; tone: string; label: string }> = {
  pass: { icon: "✓", tone: "success", label: "Passed" },
  warn: { icon: "⚠", tone: "warning", label: "Needs confirmation" },
  fail: { icon: "✕", tone: "danger", label: "Failed" },
  pending: { icon: "…", tone: "neutral", label: "Pending" },
};
