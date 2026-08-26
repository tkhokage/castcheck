# Stakeholder Management — CASTCHECK

## Stakeholder register

### Internal (delivery)
| Stakeholder | Interest | Influence | Engagement |
|-------------|----------|-----------|------------|
| Executive Sponsor | Program success, ROI, risk posture | High | Manage closely — gate approvals, exec dashboard |
| Product | User value, scope, priorities | High | Manage closely |
| Engineering | Feasibility, quality, tech debt | High | Collaborate |
| Security | Controls, threat surface, incidents | High | Collaborate |
| GRC / Compliance | Risk register, evidence, audit | Med | Keep satisfied |
| Support / Trust & Safety Ops | Ticket load, escalation, moderation | Med | Keep informed |
| AI / ML | Model behavior, guardrails, eval | Med | Collaborate |
| Design | Usability, accessibility, brand | Med | Keep informed |

### External (users & partners)
| Stakeholder | Interest | Influence | Engagement |
|-------------|----------|-----------|------------|
| Actors (primary users) | Find real work, avoid scams | Med | Keep satisfied — research, feedback |
| Casting professionals | Reach vetted talent, post listings | Med | Keep informed |
| Agencies | Directory presence, submissions | Low | Keep informed |
| Production companies | Legitimate discovery | Low | Monitor |
| Third-party platforms (Actors Access, Backstage…) | Their ToS / traffic | Low | Monitor (link-out only, no scraping) |

### Governance
| Stakeholder | Interest | Influence | Engagement |
|-------------|----------|-----------|------------|
| Legal / Privacy | Terms, data handling, likeness/AI clauses | High | Keep satisfied |
| Trust & Safety governance | Verification policy, escalation | High | Collaborate |

## Communication plan
| Audience | Artifact | Cadence |
|----------|----------|---------|
| Sponsor / execs | [Executive dashboard](executive-dashboard.md), release go/no-go | Per phase gate |
| Delivery team | RAID review, standup notes, PR reviews | Weekly / continuous |
| GRC / Security | Risk register, audit log, threat model | Per phase + on incident |
| Users | Changelog / release notes, knowledge base | Per release |

---

## RACI matrices

**R**esponsible (does the work) · **A**ccountable (owns the outcome, one per row)
· **C**onsulted · **I**nformed.

### Verification workflow (Trust & Safety)
| Activity | Product | Engineering | GRC | Moderator | Legal |
|----------|:------:|:-----------:|:---:|:--------:|:-----:|
| Define verification policy | A | C | R | C | C |
| Implement screening/scoring logic | C | R | C | C | I |
| Review high-risk cases | I | C | A | R | C |
| Approve policy / thresholds | A | I | R | C | C |
| Handle a fraud incident | I | C | A | R | C |

### Security & access control
| Activity | Security | Engineering | GRC | Product | Sponsor |
|----------|:-------:|:-----------:|:---:|:------:|:------:|
| Threat model | A/R | C | C | I | I |
| Implement auth / RBAC / MFA | C | R | I | I | I |
| Define audit-log requirements | A | R | C | I | I |
| Approve go-live security posture | A | C | R | I | C |

### AI feature delivery
| Activity | AI/ML | Product | Security | Engineering | Legal |
|----------|:----:|:------:|:-------:|:-----------:|:-----:|
| Define guardrails (no invented evidence) | A/R | C | C | C | C |
| Implement rule-based fallback | C | I | I | R | I |
| Contract-analysis "not legal advice" framing | C | C | I | R | A |
| Evaluate model outputs | A/R | C | I | C | I |

### Release / go-live
| Activity | PM | Engineering | Security | GRC | Sponsor |
|----------|:-:|:-----------:|:-------:|:---:|:------:|
| Assemble release scope | A | R | C | C | I |
| Run UAT & sign-off | A | C | C | C | I |
| Go / no-go decision | R | C | C | C | A |
| Rollback if needed | A | R | C | I | I |
