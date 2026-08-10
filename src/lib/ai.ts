import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "./constants";

// The AI layer assists human decisions. It never invents entities or evidence,
// never guarantees legitimacy, and always carries a confidence/uncertainty note.
// Without an API key, every function returns a transparent rule-based fallback.

const MODEL = "claude-sonnet-5";

export function aiEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function client(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function complete(system: string, user: string): Promise<string | null> {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    });
    const block = res.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : null;
  } catch {
    return null;
  }
}

export interface AiResult<T> {
  data: T;
  source: "ai" | "rule-based";
  confidence: "low" | "medium" | "high";
  note: string;
}

// --- Ticket triage -----------------------------------------------------------

export async function triageTicket(subject: string, description: string): Promise<
  AiResult<{ category: string; priority: string; reason: string }>
> {
  const text = `${subject}\n${description}`.toLowerCase();

  // Rule-based fallback (also the default).
  const ruleCategory =
    /password|reset/.test(text) ? "Password reset" :
    /mfa|2fa|two.factor/.test(text) ? "MFA issues" :
    /login|sign ?in|locked/.test(text) ? "Login problems" :
    /upload|self.?tape|file/.test(text) ? "Upload problems" :
    /link|url|broken/.test(text) ? "Broken audition links" :
    /scam|fraud|suspicious|fake/.test(text) ? "Suspicious opportunities" :
    /agency|agencies/.test(text) ? "Incorrect agency information" :
    /profile|headshot|resume/.test(text) ? "Profile problems" :
    /track|application/.test(text) ? "Application tracking issues" :
    "General technical";

  const rulePriority =
    /scam|fraud|breach|takeover|hacked|security|privacy/.test(text) ? "critical" :
    /many|multiple|everyone|all users|outage|down/.test(text) ? "high" :
    /can.?t|cannot|blocked|unable/.test(text) ? "medium" : "low";

  const fallback: AiResult<{ category: string; priority: string; reason: string }> = {
    data: { category: ruleCategory, priority: rulePriority, reason: "Matched on keywords in the subject and description." },
    source: "rule-based",
    confidence: "medium",
    note: "Rule-based classification. Confirm before acting.",
  };

  const raw = await complete(
    `You triage support tickets for an actor opportunity platform. Categories: ${TICKET_CATEGORIES.join(", ")}. Priorities: ${TICKET_PRIORITIES.join(", ")}. Respond ONLY as JSON: {"category": "...", "priority": "...", "reason": "..."}. Never invent facts.`,
    `Subject: ${subject}\n\nDescription: ${description}`,
  );
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    if (parsed.category && parsed.priority) {
      return { data: parsed, source: "ai", confidence: "medium", note: "AI-assisted suggestion. A human analyst confirms the final category and priority." };
    }
  } catch {
    /* fall through */
  }
  return fallback;
}

// --- Opportunity risk narrative ---------------------------------------------

export async function riskNarrative(input: {
  title: string;
  indicators: { category: string; description: string; severity: string }[];
  level: string;
}): Promise<AiResult<{ summary: string }>> {
  const fallback: AiResult<{ summary: string }> = {
    data: {
      summary:
        input.indicators.length === 0
          ? "No risk indicators were recorded for this listing. Absence of indicators is not proof of legitimacy — review the verification checks."
          : `${input.indicators.length} risk indicator(s) recorded across ${new Set(input.indicators.map((i) => i.category)).size} categor(ies). Overall inherent risk is assessed as ${input.level}.`,
    },
    source: "rule-based",
    confidence: "medium",
    note: "Rule-based summary of recorded indicators.",
  };

  const raw = await complete(
    `You summarize risk indicators for actor casting opportunities. Be factual and cautious. Never guarantee legitimacy or call something a scam on a single signal. 2-3 sentences.`,
    `Listing: ${input.title}\nOverall level: ${input.level}\nIndicators:\n${input.indicators.map((i) => `- [${i.category}/${i.severity}] ${i.description}`).join("\n") || "none recorded"}`,
  );
  if (!raw) return fallback;
  return { data: { summary: raw.trim() }, source: "ai", confidence: "medium", note: "AI-assisted summary. Assists — does not replace — human review." };
}

// --- Career fit narrative ----------------------------------------------------

export async function fitNarrative(input: {
  score: number;
  rows: { label: string; rating: string }[];
  oppTitle: string;
}): Promise<AiResult<{ summary: string }>> {
  const strong = input.rows.filter((r) => r.rating === "Excellent" || r.rating === "Strong").map((r) => r.label);
  const weak = input.rows.filter((r) => r.rating === "Low" || r.rating === "Moderate").map((r) => r.label);
  const fallback: AiResult<{ summary: string }> = {
    data: {
      summary: `Career fit ${input.score}/100. Strengths: ${strong.join(", ") || "—"}. Watch: ${weak.join(", ") || "—"}. Fit is separate from risk; review both.`,
    },
    source: "rule-based",
    confidence: "high",
    note: "Computed from your profile and the listing.",
  };

  const raw = await complete(
    `You explain career fit for an emerging actor. Fit is about career goals, not legitimacy. 2 sentences. Encourage but never guarantee outcomes.`,
    `Opportunity: ${input.oppTitle}\nScore: ${input.score}/100\n${input.rows.map((r) => `${r.label}: ${r.rating}`).join("\n")}`,
  );
  if (!raw) return fallback;
  return { data: { summary: raw.trim() }, source: "ai", confidence: "high", note: "AI-assisted explanation of your fit." };
}

// --- Contract plain-language summary (spec §32) ------------------------------

export async function contractNarrative(input: {
  findings: { label: string; concern: string; explain: string }[];
  flags: string[];
}): Promise<AiResult<{ summary: string }>> {
  const fallback: AiResult<{ summary: string }> = {
    data: {
      summary:
        input.flags.length > 0
          ? `The biggest things to review with an attorney: ${input.flags.join(", ")}. Read each clause below and don't sign anything you don't understand.`
          : `No high-concern clauses were auto-detected, but review each clause below and have an attorney look at anything you're unsure about before signing.`,
    },
    source: "rule-based",
    confidence: "medium",
    note: "Plain-language summary of the detected clauses. Not legal advice.",
  };

  const raw = await complete(
    `You help an emerging actor understand an entertainment contract. Explain in plain, calm language. You are NOT a lawyer: never give legal advice, never say a clause is 'fine' or 'safe', and always steer serious items to a qualified entertainment attorney. 2-3 sentences.`,
    `Detected clauses:\n${input.findings.map((f) => `- ${f.label} [${f.concern}]: ${f.explain}`).join("\n")}\nHigh-concern: ${input.flags.join(", ") || "none"}`,
  );
  if (!raw) return fallback;
  return { data: { summary: raw.trim() }, source: "ai", confidence: "medium", note: "AI-assisted summary. Not legal advice — consult an attorney." };
}
