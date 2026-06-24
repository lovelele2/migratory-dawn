# AGENTS.md

## Project
**Name:** Migratory Dawn / 候鸟逐日  
**Product type:** Mobile-first responsive Web App  
**Current phase:** Five-day hackathon MVP  
**Primary user:** A non-technical product owner who needs concrete, step-by-step instructions.

## Mandatory reading order
Before starting any implementation task, read:

1. `AGENTS.md`
2. `docs/PRD.md`
3. `docs/DESIGN.md`
4. `docs/TECHNICAL.md`
5. `docs/PROGRESS.md`
6. `docs/DECISIONS.md`

Do not begin coding until these files have been reviewed.

## Working rules
1. Do not silently expand, reduce, reinterpret, or remove PRD scope.
2. If two requirements conflict, report the conflict and stop before making a product decision.
3. Never place API keys, service-role keys, private tokens, or secrets in client-side code, screenshots, commits, examples, or public files.
4. Windy API credentials must remain server-side in `.env.local` locally and in protected Vercel environment variables after deployment.
5. Break work into small, independently testable steps.
6. After each task:
   - run relevant checks;
   - report changed files;
   - report commands executed;
   - state the local URL or test path;
   - explain exactly how the product owner verifies the result.
7. Update `docs/PROGRESS.md` after every completed milestone.
8. Record new product or architecture decisions in `docs/DECISIONS.md`.
9. Do not modify or delete files outside the project directory.
10. Prefer safe fixes. Do not permanently disable SSL verification, authentication, row-level security, or other security controls merely to bypass an error.
11. The product owner is not a developer. Avoid unexplained jargon. Every instruction must specify:
    - where to click or which command to run;
    - what result should appear;
    - what to do if the result differs.
12. Never claim a camera is live unless the returned camera record contains a valid `player.live`.
13. Never label a static image, time-lapse player, or curated recording as a live stream.
14. Camera-title direction words such as `East` or `North-west` may be used only as weak hints, not authoritative orientation data.
15. Do not fetch all 73,000+ cameras on every user request. Use geographic filtering, pagination, caching, and a curated whitelist.
16. Keep the MVP mobile-first and demo-safe. All external-content failures must have a fallback path.

## Default technology
- Next.js with App Router
- TypeScript
- Tailwind CSS
- Supabase for authentication and database
- Mapbox GL JS for globe and geographic visualization
- SunCalc for sunrise, solar altitude, and solar azimuth calculations
- Vercel for deployment
- npm unless the repository explicitly changes package manager

## Definition of done for each engineering task
A task is complete only when:
- the implementation exists;
- it runs locally;
- relevant errors are handled;
- no secret is exposed;
- the product owner has a visible verification path;
- documentation is updated.
