# Support workflow

## Channels

- **Knowledge base** (`/knowledge`) — self-service how-tos and trust guidance.
- **Support center** (`/support`) — a user's own tickets + quick links.
- **New ticket** (`/support/new`) — auto-triaged on submit.
- **Ticket queue** (`/dashboard/tickets`) — staff view with metrics.

## Ticket lifecycle

```
open → in_progress → waiting → resolved → closed
```

## Categories

Login problems · Password reset · MFA issues · Profile problems · Upload
problems · Broken audition links · Application tracking issues · Incorrect agency
information · Suspicious opportunities · Account problems · General technical.

## Priority

| Priority | Trigger |
|----------|---------|
| Low | General questions |
| Medium | Feature unavailable for one user |
| High | Multiple users affected or major workflow blocked |
| Critical | Security, privacy, account takeover, platform outage |

Priority is proposed automatically on submit by `triageTicket` (AI-assisted with
a rule-based fallback), then confirmed by an analyst.

## Auto-triage

On creation, subject + description are classified into a category and priority.
The result is stored in internal notes with its source and confidence, e.g.:

> AI triage (rule-based, medium confidence): matched on keywords…

A human analyst always confirms before acting.

## Resolution workflows

Each ticket detail shows a category-specific checklist. Example — *Upload
problems*:

1. Verify account → 2. Verify file type → 3. Verify file size → 4. Test browser
→ 5. Test upload service → 6. Reproduce → 7. Resolve → 8. Document resolution.

## Reports become tickets

Every opportunity has a **Report** button (scam, suspicious payment, excessive
personal-info request, impersonation, and more). A submitted report creates both
a trust & safety report (for moderation) and a support ticket, so nothing falls
through the cracks.

## Metrics

The queue surfaces open count, critical/high count, resolution rate, and total —
the foundation for first-response time, average resolution time, volume by
category/priority, and reopened-ticket tracking.
