<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CASTCHECK phase status

Product phases (see docs/roadmap.md): 1 MVP ✅ · 2 Trust ✅ · 3 Support ✅ ·
4 Security & GRC ✅ · 5 AI ✅ · 6 Real data — in progress (live web verification +
real agency seeding landed).

## Ease-of-use / production-smoothness pass (G-phases)

| Phase | Focus | Status |
|-------|-------|--------|
| G1 | Commit env example templates; clean-clone works | ✅ |
| G2 | Fail-closed AUTH_SECRET; gate demo-accounts card | ✅ |
| G3 | Real email integration; forgot-password; 2FA recovery codes | ✅ |
| G4 | Object storage for uploads; Redis rate limiting | ✅ |
| G5 | error/not-found/loading pages; success confirmations | ✅ |
| G6 | /privacy + /terms; contact + security.txt (placeholder addrs, see TODO) | ✅ |
| G7 | Accessibility pass (aria, alt, focus, contrast) | ✅ |
| G8 | Knowledge-base outbound "verify independently" links | ⬜ |
| G9 | Full deploy + post-deploy + regression checklists | ⬜ |
