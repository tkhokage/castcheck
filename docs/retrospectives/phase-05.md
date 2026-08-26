# Retrospective — Phase 5: AI

**Scope:** screening narrative, risk summary, career-fit narrative, ticket triage,
contract analysis + digital-likeness flags, guardrails.

## What went well
- Deciding the **guardrails first** ([DEC-001](../decision-log.md)) — rule-based
  baseline, AI only summarizes, every output labeled with confidence — made the
  features safe to ship and easy to test.
- The rule-based fallbacks meant the whole AI surface works with no API key, so
  the demo never depends on a paid dependency.

## What failed / was harder than expected
- Programmatic browser testing couldn't reliably populate a React form's state,
  which briefly made screening look under-powered until it was unit-tested
  directly (7 indicators on the scam sample) — a testing-method issue, not a
  logic bug.

## What surprised us
- Contract analysis turned out to be the most *portfolio-differentiating* feature
  from the least code — deterministic clause detection + a plain-language layer.

## What changed
- Chose **data minimization** for contracts ([DEC-006](../decision-log.md)): store
  findings, not raw text — which also shrank the security-review surface (CR-001).

## What we'll do differently
- Build an explicit AI-evaluation harness (golden cases) rather than relying only
  on unit tests of the deterministic path. Tracked as KR3-adjacent backlog.
