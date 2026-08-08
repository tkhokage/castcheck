# AI limitations

The AI layer assists human decisions. It does not make them.

## What the AI may do

- Classify and triage support tickets (category + priority).
- Summarize recorded risk indicators for an opportunity.
- Explain an actor's computed career fit for an opportunity.
- (Extensible) opportunity classification, agency analysis, KB assistance.

## What the AI must never do

- **Never invent** agencies, casting calls, production companies, or
  verification evidence.
- **Never guarantee** legitimacy, representation, or employment.
- **Never provide legal advice.**
- **Never present assumptions as facts.**

## How that is enforced

- **Grounded inputs only.** Prompts contain only the listing/ticket text that
  already exists; the model is asked to summarize or classify, not to research.
- **Confidence on everything.** Every result from `src/lib/ai.ts` returns a
  `source` (`ai` | `rule-based`) and a `confidence` (`low`/`medium`/`high`),
  both rendered in the UI (e.g. the "AI-assisted · medium confidence" badge on a
  risk summary).
- **Human-in-the-loop.** AI output is framed as a suggestion. Moderators make the
  final verification decision; analysts confirm ticket triage.
- **Graceful fallback.** With no `ANTHROPIC_API_KEY`, every function returns a
  transparent rule-based result, clearly labeled as such. The product never
  depends on the model being available.

## Later phases (designed, not built)

- **Contract analysis** — extract and explain commission, exclusivity,
  termination, likeness/AI-replica clauses. Issue-spotting and education only;
  always points to a qualified entertainment attorney where a clause carries real
  consequence.
- **Digital likeness module** — flag AI-training, voice-cloning, and synthetic-
  performance language for careful review.
