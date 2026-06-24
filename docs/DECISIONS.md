# DECISIONS.md — Frozen decisions and rationale

## D-001 — Build a Web App first
**Decision:** Build a responsive Web App, not a native mobile app.  
**Reason:** Five-day delivery, faster iteration, and public link sharing.

## D-002 — Next.js stack
**Decision:** Use Next.js, TypeScript, and Tailwind CSS.  
**Reason:** One project can handle interface and protected server routes.

## D-003 — Use Windy Webcams API
**Decision:** Windy is the primary external camera source.  
**Reason:** API validation confirmed coordinates, images, time-lapse players, and partial live players.

## D-004 — Truthful media labels
**Decision:** Live, time-lapse, still image, and curated video must be labeled separately.  
**Reason:** Product credibility depends on real human imagery, not simulated real-time claims.

## D-005 — Demo cannot depend entirely on live cameras
**Decision:** Keep curated real sunrise videos as final fallback.  
**Reason:** Cameras may be offline, blocked, facing the wrong direction, cloudy, or unavailable during judging.

## D-006 — Camera selection is hybrid
**Decision:** Use automatic geographic and solar filtering, followed by human aesthetic approval.  
**Reason:** The API has location but not reliable orientation or scenic-quality metadata.

## D-007 — Do not crawl all cameras on every request
**Decision:** Use geographic filters, pagination, caching, and a whitelist.  
**Reason:** The API contains roughly 73,000 cameras.

## D-008 — Upload sunrise later
**Decision:** User-facing sunrise upload is excluded from the five-day MVP.  
**Reason:** It introduces storage, moderation, rights, and interface scope. Data structures remain reserved.

## D-009 — Letters support direct and random delivery
**Decision:** Users may send to a specific bird code or choose random delivery.  
**Reason:** Direct delivery supports intentional relationships; random delivery preserves the product's stranger-connection concept.

## D-010 — Delivery follows sunrise narrative
**Decision:** Letters are picked up at origin sunrise and delivered according to destination timing.  
**Reason:** Immediate chat would weaken the bird-and-dawn narrative.

## D-011 — Compute status instead of relying on scheduled jobs
**Decision:** MVP derives letter status from timestamps.  
**Reason:** Reduces infrastructure and timing risk.

## D-012 — Supabase for identity and data
**Decision:** Use Supabase Auth, Postgres, and row-level security.  
**Reason:** Fast implementation with per-user access control.

## D-013 — Mapbox for globe
**Decision:** Use Mapbox GL JS for globe and location visualization.  
**Reason:** Supports interactive globe projection and markers.

## D-014 — API key is server-only
**Decision:** Windy key must never be placed in browser code.  
**Reason:** Prevent credential exposure and abuse.

## D-015 — Visual direction is restrained
**Decision:** Avoid cartoon, social-feed, dashboard, and generic SaaS aesthetics.  
**Reason:** The intended experience is cinematic, quiet, and emotionally spacious.

## D-016 — Codex works from repository context
**Decision:** Maintain product knowledge in project files rather than relying on chat history.  
**Reason:** Codex threads may not retain this conversation; repository documents are persistent and reviewable.

## D-017 — Safe certificate repair only
**Decision:** Do not permanently disable npm SSL verification.  
**Reason:** Dependency installation must remain secure.

## D-018 — Accept Supabase publishable key alias
**Decision:** Treat `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as an accepted public-key alias alongside `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
**Reason:** The dashboard may surface the public key with either label, and both names refer to the same client-safe credential for MVP setup.

## D-019 — Demo fallback preserves local progress
**Decision:** Keep the local demo store as a fallback when Supabase OTP or persistence cannot complete.
**Reason:** The app must still open, let the owner test the flow, and show a clear failure-free path during MVP work.

## D-018 — Use the system PEM bundle for npm on this machine
**Decision:** Set `npm_config_cafile=/etc/ssl/cert.pem` for registry-bound npm commands in this environment.  
**Reason:** This machine trusts the npm registry through the system PEM bundle, which fixes the local issuer error without disabling certificate checks.

## D-019 — Use webpack for local verification in this sandbox
**Decision:** Run `next build --webpack` and `next dev --webpack` for local verification here.  
**Reason:** Turbopack attempted to bind a port during build and hit a sandbox `EPERM` error, while webpack completed successfully.

## D-020 — Localize the visible UI to Chinese
**Decision:** Keep user-facing copy in Chinese by default, while preserving route names and technical identifiers in code.  
**Reason:** The primary product owner reads Chinese, so the interface should be immediately understandable without translation effort.

## D-021 — Surface camera media directly on the homepage
**Decision:** Show the selected camera's visual preview on the homepage, and provide an explicit link to the live player when Windy returns one.  
**Reason:** A live label alone is not enough for the product owner to verify that camera data is actually rendering.

## D-022 — Use a shared demo state route for MVP flows
**Decision:** Keep login, letters, camera review, and demo toggles in a shared server-backed demo state route for the hackathon MVP.  
**Reason:** The product owner needs a cross-page working flow before Supabase and other production backends are wired in.

## D-023 — Mapbox loads only when configured
**Decision:** The globe should attempt a real Mapbox GL JS render when `NEXT_PUBLIC_MAPBOX_TOKEN` is present, and fall back to the safe globe view otherwise.  
**Reason:** The app remains usable during local development and still supports the production Mapbox path once the token is configured.

## D-024 — Prefer Windy player embeds on the homepage
**Decision:** When Windy returns a live or time-lapse player URL, the homepage should embed it in-frame instead of only showing a static preview.  
**Reason:** The product owner needs to see the actual motion source, not just a thumbnail, when a playable source exists.

## D-025 — Bias camera selection toward the estimated morning band
**Decision:** Boost cameras near the estimated morning terminator and allow a curated whitelist to override the ordinary distance gate.  
**Reason:** The MVP should prefer sunrise-appropriate cameras instead of ranking only by generic metadata or popularity.

## D-026 — Add a no-secret Supabase health page
**Decision:** Expose Supabase connectivity only through a page that reports configuration and response status without printing any secret values.  
**Reason:** The product owner can verify whether the backend is wired correctly without risking secret leakage.

## D-027 — Refresh the sunrise snapshot on a timer
**Decision:** Have the homepage and globe re-fetch the sunrise snapshot periodically instead of treating it as a one-time load.  
**Reason:** The bird position and current source should keep moving with time, not freeze at the first page load.

## D-028 — Persist demo fallback state in the browser
**Decision:** Store demo login, letter, and camera-review state in client-side local storage instead of relying only on server memory.  
**Reason:** Vercel serverless instances do not guarantee in-memory persistence, so browser storage keeps demo sessions stable after refresh.
