# Agency District — first usable prototype

## User task and delivery scope

Choose a market and representation specialty, select a relevant agency, and open
its existing evidence and submission details. This is an optional presentation
of the existing directory, not a geographic map or a new verification engine.

Implemented with AI assistance in the isolated branch
`codex/agency-district-prototype`, based on the existing verification-fix branch.
Original checkout and its uncommitted database-provider edit were preserved.
No production database, deployment, agency contact or external application was changed.

## How data moves

1. URL search, location and specialty filters reach the server agency page.
2. The server queries existing agency records and applies specialty filtering.
3. Existing `agencyMatch` calculates career fit for the signed-in profile.
4. `districtAgency` projects only ID, name, location, specialties, recorded
   verification state, score/null, demo flag and ISO verification timestamp/null.
5. The browser loads Three.js/React Three Fiber only after "Explore in 3D".
6. A stable agency ID connects each selection to its existing detail page.

The actor profile, private correspondence, database client and secrets never
enter the scene props. Risk/verification and career fit remain separate.
Non-demo records are labeled "Non-demo record", not "live" or newly verified.

## Interaction and limits

- Normal list remains the default and stays rendered below the scene.
- At most 24 filtered results appear in 3D; visible/total counts and a full-list
  link disclose this limit. All matching records remain in the ordinary list.
- Equal-size primitive buildings prevent size or luxury implying legitimacy.
- Numbered HTML controls and named native buttons provide keyboard/touch access.
  Enter/Space select; Escape clears; detail link uses the existing route.
- Filtering out the selected agency clears the selection.
- Reset remounts the static scene; there is no first-person camera, automatic
  rotation or motion to disable. Touch allows vertical page scrolling.
- WebGL support failure and a component error boundary retain the HTML path.
- On-demand rendering and DPR 1–1.5 limit work. Device performance budgets and
  usability benefits have not been measured; 3D remains optional.

Dependencies tested: React 19.2.8, React Three Fiber 9.7.0, Three.js 0.185.1.
The installed Fiber peer range includes React 19.2.8. Installed Next.js
lazy-loading and server/client documentation guided the client-only dynamic import.

## Reproduce the local preview (PowerShell)

Use a separate checkout and a new local SQLite database; never seed a production
database. The seed script deletes existing records in its selected database.

```powershell
npm install
$env:DATABASE_URL = 'file:./district-preview.db'
# Only create this file if it does not already exist.
if (-not (Test-Path prisma/district-preview.db)) {
  New-Item -ItemType File prisma/district-preview.db
}
npm run db:push
# Run only for this fresh disposable local demo database:
npm run db:seed
npm run dev -- --hostname 127.0.0.1 --port 3101
```

Open http://127.0.0.1:3101/agencies. The preview has no production credentials.
In a second shell with the same DATABASE_URL:
`npm test`, `npm run lint`, `npm run build`.
Browser regression: `node scripts/agency-district-browser.mjs`.
It uses installed Google Chrome in headless mode; PREVIEW_URL can override the
local URL. Screenshots go to ignored `artifacts/agency-district/`.

## Evidence — September 6, 2026

- Verification fix is present: zero checks remain needs_review, while a known
  high-risk indicator still wins. Public GitHub API confirmed PR #1 open/unmerged.
- 56 unit tests across 9 files passed (53 existing plus 3 projection/layout tests).
- Production build and TypeScript passed with local DATABASE_URL configured.
- Browser automation passed opt-in loading, keyboard selection/Escape, numbered
  building selection, reset, detail navigation, location filtering, no results,
  removed selection, narrow touch layout/reduced motion and unsupported-WebGL
  fallback. Desktop browser reported no uncaught page errors.
- Local screenshot review led to numbered building controls and a centered layout.
- Existing broad UI element types were narrowed to actual supported props to
  avoid conflicts with Fiber's added JSX element types.
- Existing theme-toggle lint failure was corrected using an external-store
  subscription, with a working in-memory theme if browser storage is unavailable.
- npm audit reports a high-severity deepmerge-ts advisory through existing
  Prisma tooling (GHSA-ggr8-5vv4-36mx). No forced major upgrade/downgrade applied.

Not yet evidenced: three-actor comparison study, real-device GPU/performance
measurements, dynamically failing chunk-download recovery, cloud deployment or
remote CI for this new branch. Desktop Chrome mobile emulation is not a physical
phone test. Basic WebGL fallback is tested; all possible GPU driver failures are not.

## Subsequent milestones

Blender modeling/GLB export and AI-guided structured filters remain separate,
unimplemented milestones. No .blend file, agency relationship, live submission,
verification evidence or improved user outcome is claimed.

## Learning checkpoint

- Server: finds records and computes fit. Browser: displays and selects them.
- One small exercise: change the building roof color, then confirm the same
  agency ID still opens the same details.
- Teach-back: Why retain the list? Why isn't a high match score evidence of
  safety? How does an agency ID connect a building to its detail page?
