// Contract analysis (spec §32–33). Issue-spotting and EDUCATION ONLY.
// This is never legal advice. Anything with real consequence points the actor
// to a qualified entertainment attorney.
//
// Pure, deterministic logic so it is testable and works without the AI layer.

export type Concern = "info" | "caution" | "high";

export interface ClauseFinding {
  key: string;
  label: string;
  concern: Concern;
  excerpt: string; // the matched sentence (minimized — only the relevant snippet)
  explain: string; // what this kind of clause typically means
  watchFor: string; // what the actor should look at / confirm
}

export interface ContractReport {
  findings: ClauseFinding[];
  flags: ClauseFinding[]; // subset with concern === "high"
  cautions: number;
  commissionPct: number | null;
  summary: string;
  disclaimer: string;
}

const DISCLAIMER =
  "CASTCHECK explains contract language for your understanding only. This is not legal advice. " +
  "Before signing, have a qualified entertainment attorney review anything that carries real consequence.";

interface Rule {
  key: string;
  label: string;
  base: Concern;
  patterns: RegExp[];
  explain: string;
  watchFor: string;
}

// Order matters only for display grouping; detection is independent per rule.
const RULES: Rule[] = [
  {
    key: "digital_likeness",
    label: "AI / digital likeness",
    base: "high",
    patterns: [
      /\bdigital (replica|double|likeness|clone|human)\b/i,
      /\bartificial intelligence\b/i,
      /\bA\.?I\.?\b(?=.*(likeness|voice|image|performance|replica|train))/i,
      /\bvoice (clon|synth|model|replicat)/i,
      /\b(synthetic|computer[- ]generated|machine[- ]generated) (performance|voice|likeness|version)/i,
      /\b(train|training)\b.*\b(model|AI|neural|dataset)\b/i,
      /\bneural network|deepfake|generative\b/i,
      /\bsimulat(e|ion) of (your|the artist).{0,20}(voice|likeness|image)/i,
    ],
    explain:
      "Language allowing an AI/digital version of your voice, face, or performance — created, trained on, or reused by the company or third parties.",
    watchFor:
      "Whether digital-replica use is opt-in and separately paid, the exact permitted uses, the duration, and whether third parties can train AI on your likeness. Have an attorney review this.",
  },
  {
    key: "perpetual_rights",
    label: "Perpetual / irrevocable rights",
    base: "high",
    patterns: [
      /\bin perpetuity\b/i,
      /\bperpetual\b/i,
      /\birrevocab(le|ly)\b/i,
      /\bforever\b/i,
      /\bthroughout the (universe|world) in perpetuity\b/i,
      /\ball media now known or hereafter (devised|invented|created)\b/i,
    ],
    explain:
      "Rights granted forever and/or that you cannot take back — often attached to image, likeness, or recorded performance.",
    watchFor:
      "Whether 'perpetual' or 'irrevocable' applies to your name, image, likeness, or a digital replica. Perpetual likeness rights are a serious commitment — get legal review.",
  },
  {
    key: "likeness",
    label: "Name, image & likeness",
    base: "caution",
    patterns: [
      /\b(name,? and )?likeness\b/i,
      /\bright to use your (name|image|photograph|voice)\b/i,
      /\bpublicity rights\b/i,
    ],
    explain:
      "How the company may use your name, image, photographs, and likeness (for promotion, packaging, etc.).",
    watchFor:
      "The permitted uses, the media, the territory, and how long these rights last after the contract ends.",
  },
  {
    key: "exclusivity",
    label: "Exclusivity",
    base: "caution",
    patterns: [/\bexclusiv(e|ely|ity)\b/i, /\bsole and exclusive\b/i],
    explain:
      "Whether you can work with only this agency/company for the covered categories, or may also work with others.",
    watchFor:
      "Which categories are exclusive (film/TV, commercial, theater, voice) and whether any are carved out. Broad exclusivity limits your other opportunities.",
  },
  {
    key: "commission",
    label: "Commission",
    base: "info",
    patterns: [/\bcommission\b/i, /\b\d{1,2}\s?%/, /\bpercent(age)? of (your )?(gross|earnings|compensation)\b/i],
    explain:
      "The percentage the agency/manager takes from what you earn on covered work.",
    watchFor:
      "The exact percentage and what it applies to. Agency commissions are commonly 10% (union) up to ~20%; unusually high or stacked commissions deserve scrutiny.",
  },
  {
    key: "term",
    label: "Term / duration",
    base: "info",
    patterns: [/\bterm of this agreement\b/i, /\b(one|two|three|1|2|3)\s?\(?\d?\)?\s?(year|month)s?\b/i, /\bperiod of\b/i],
    explain: "How long the agreement lasts.",
    watchFor: "The length and when/how it ends. Long initial terms lock you in — pair this with the exclusivity and renewal clauses.",
  },
  {
    key: "renewal",
    label: "Renewal / auto-renewal",
    base: "caution",
    patterns: [/\bautomatic(ally)? renew/i, /\brenew(al|ed|s)?\b/i, /\bevergreen\b/i],
    explain: "Whether the contract renews on its own unless you cancel.",
    watchFor:
      "Auto-renewal terms and the exact window/notice required to opt out — miss it and you can be locked in for another full term.",
  },
  {
    key: "territory",
    label: "Territory",
    base: "info",
    patterns: [/\bterritory\b/i, /\bworldwide\b/i, /\bthroughout the world\b/i, /\bthe universe\b/i],
    explain: "The geographic area the agreement covers.",
    watchFor: "Whether it is broader than where you actually work. 'The universe' / 'worldwide' is common in likeness grants — read alongside likeness/AI clauses.",
  },
  {
    key: "termination",
    label: "Termination",
    base: "info",
    patterns: [/\bterminat(e|ion|ing)\b/i, /\bnotice of termination\b/i, /\bfor cause\b/i],
    explain: "How and when either side can end the agreement.",
    watchFor: "How much notice you must give, whether you can leave without cause, and any penalties for terminating.",
  },
  {
    key: "post_term_commission",
    label: "Post-termination commissions",
    base: "caution",
    patterns: [/\bafter (the )?(termination|expiration)\b/i, /\bpost[- ]termination\b/i, /\bsunset (clause|provision|period)\b/i, /\bcommissions? (shall|will) (continue|survive)\b/i],
    explain: "Whether the agency keeps commissioning work after you leave (e.g., on jobs booked during the term).",
    watchFor: "Which post-termination earnings are commissionable and for how long. Broad or indefinite 'sunset' commissions are worth negotiating.",
  },
  {
    key: "expenses",
    label: "Expenses & deductions",
    base: "caution",
    patterns: [/\bexpenses?\b/i, /\breimburs/i, /\bdeduct(ed|ion)?\b/i, /\bchargeable to (you|the artist)\b/i],
    explain: "Costs the company may deduct from your earnings or bill you for.",
    watchFor: "Whether expenses need your pre-approval and any caps. Beware mandatory fees, classes, or photo packages billed to you — legitimate agencies don't require these to sign you.",
  },
  {
    key: "payment",
    label: "Payment terms",
    base: "info",
    patterns: [/\bpaid within\b/i, /\bnet \d{1,3}\b/i, /\bpayment (terms|schedule)\b/i, /\bdisburse/i],
    explain: "When and how you get paid after the company receives money for your work.",
    watchFor: "How many days until you're paid after they collect, and whether payments flow through the agency first.",
  },
  {
    key: "confidentiality",
    label: "Confidentiality",
    base: "info",
    patterns: [/\bconfidential(ity)?\b/i, /\bnon[- ]disclosure\b/i, /\bNDA\b/],
    explain: "Restrictions on what you can share about the project or agreement.",
    watchFor: "How broad it is and how long it lasts. Very broad confidentiality can limit you from discussing pay or unfair treatment.",
  },
  {
    key: "publicity_obligations",
    label: "Publicity obligations",
    base: "caution",
    patterns: [/\bpublicity\b/i, /\bpromot(e|ional)\b/i, /\bsocial media\b/i, /\bpersonal appearances?\b/i, /\bpress\b/i],
    explain: "Things you're required to do to promote the project (posts, appearances, interviews).",
    watchFor: "Whether obligations are unpaid, how much time they demand, and whether they control your personal social media.",
  },
];

// Elevated-concern combinations bump certain findings up.
function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.;:])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function trimExcerpt(s: string, max = 240): string {
  return s.length > max ? s.slice(0, max).trimEnd() + "…" : s;
}

export function analyzeContract(text: string): ContractReport {
  const sentences = splitSentences(text);
  const findings: ClauseFinding[] = [];

  for (const rule of RULES) {
    const hit = sentences.find((s) => rule.patterns.some((p) => p.test(s)));
    if (!hit) continue;

    let concern = rule.base;
    // Likeness that also mentions perpetual/AI is a high-concern flag.
    if (rule.key === "likeness" && /\b(perpetu|irrevocab|in perpetuity|digital|AI|forever)\b/i.test(hit)) {
      concern = "high";
    }
    findings.push({
      key: rule.key,
      label: rule.label,
      concern,
      excerpt: trimExcerpt(hit),
      explain: rule.explain,
      watchFor: rule.watchFor,
    });
  }

  // Commission percentage extraction + flag if unusually high.
  let commissionPct: number | null = null;
  const commissionFinding = findings.find((f) => f.key === "commission");
  if (commissionFinding) {
    const m = commissionFinding.excerpt.match(/(\d{1,2})\s?%/);
    if (m) {
      commissionPct = parseInt(m[1], 10);
      if (commissionPct > 20) {
        commissionFinding.concern = "high";
        commissionFinding.watchFor =
          `This lists roughly ${commissionPct}% commission — above the typical 10–20% range. Confirm what it applies to and have it reviewed.`;
      }
    }
  }

  const flags = findings.filter((f) => f.concern === "high");
  const cautions = findings.filter((f) => f.concern === "caution").length;

  const summary =
    findings.length === 0
      ? "No recognizable contract clauses were detected. Paste the full agreement text for a useful review, and consult an attorney before signing."
      : `Identified ${findings.length} clause${findings.length === 1 ? "" : "s"}` +
        (flags.length ? `, including ${flags.length} that warrant careful review (${flags.map((f) => f.label).join(", ")}).` : `. Nothing was auto-flagged as high concern, but review the details.`);

  return { findings, flags, cautions, commissionPct, summary, disclaimer: DISCLAIMER };
}

export const CONCERN_META: Record<Concern, { label: string; tone: string }> = {
  info: { label: "For your info", tone: "neutral" },
  caution: { label: "Review carefully", tone: "warning" },
  high: { label: "Get legal review", tone: "danger" },
};
