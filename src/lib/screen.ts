// Lightweight automated screening for newly submitted opportunities (spec §6, §13).
// Detects common risk patterns and proposes indicators + an inherent risk estimate.
// This assists moderation; a human makes the final call.

export interface ScreenResult {
  indicators: { category: string; code: string; description: string; severity: string }[];
  likelihood: number;
  impact: number;
  suggestedState: string;
  suggestedStatus: string;
}

const RULES: { test: RegExp; category: string; code: string; description: string; severity: string }[] = [
  { test: /gift ?card/i, category: "financial", code: "gift_card", description: "Mentions gift-card payment.", severity: "high" },
  { test: /\bwire\b|western union|money ?gram/i, category: "financial", code: "wire", description: "Mentions wire transfer.", severity: "high" },
  { test: /crypto|bitcoin|usdt/i, category: "financial", code: "crypto", description: "Mentions cryptocurrency payment.", severity: "high" },
  { test: /registration fee|pay.*(fee|to audition|to join)|upfront fee|deposit required/i, category: "financial", code: "upfront_fee", description: "Requests an upfront or registration fee.", severity: "high" },
  { test: /mandatory.*(package|photo)|photo package/i, category: "financial", code: "mandatory_package", description: "Requires a mandatory paid package.", severity: "high" },
  { test: /guarantee(d)?.*(role|representation|fame|employment|work)/i, category: "communication", code: "guarantee", description: "Guarantees roles, representation, or employment.", severity: "high" },
  { test: /urgent|apply fast|immediately|limited spots|act now/i, category: "communication", code: "urgency", description: "Uses urgency or pressure tactics.", severity: "medium" },
  { test: /telegram|whatsapp|dm me|text me directly/i, category: "communication", code: "off_platform", description: "Pushes contact off-platform.", severity: "medium" },
  { test: /\bssn\b|social security|government id|passport number|bank(ing)? (info|details|account)|routing number/i, category: "information", code: "highly_sensitive", description: "Requests highly sensitive personal or financial data.", severity: "high" },
  { test: /home address/i, category: "information", code: "home_address", description: "Requests home address.", severity: "medium" },
];

export function screenOpportunity(input: {
  description?: string | null;
  payDetails?: string | null;
  submissionMethod?: string | null;
  productionCompany?: string | null;
  compensation?: string | null;
}): ScreenResult {
  const text = [input.description, input.payDetails, input.submissionMethod].filter(Boolean).join("  ");
  const indicators = RULES.filter((r) => r.test.test(text)).map(({ test, ...rest }) => { void test; return rest; });

  // Quality signals
  if (!input.productionCompany) {
    indicators.push({ category: "quality", code: "no_company", description: "No production company identified.", severity: "medium" });
  }

  const highs = indicators.filter((i) => i.severity === "high").length;
  const meds = indicators.filter((i) => i.severity === "medium").length;

  const likelihood = Math.min(5, 1 + highs * 2 + meds);
  const impact = highs > 0 ? 5 : meds > 0 ? 3 : 2;

  let suggestedState = "needs_review";
  let suggestedStatus = "published";
  if (highs >= 2) { suggestedState = "high_risk"; suggestedStatus = "flagged"; }
  else if (highs === 1) { suggestedState = "flagged"; suggestedStatus = "flagged"; }

  return { indicators, likelihood, impact, suggestedState, suggestedStatus };
}
