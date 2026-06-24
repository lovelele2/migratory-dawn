# PROGRESS.md — Current project state

**Last updated:** 2026-06-24

## 1. Completed product work
- Product concept defined: a bird follows dawn around Earth.
- Five-day MVP scope established.
- PRD version 0.2 accepted as the current scope.
- User-uploaded sunrise is postponed from current MVP.
- Upload data structure and future acceptance criteria remain reserved.
- Letters must support:
  - direct delivery to a specified user;
  - random delivery.
- Live content must have truthful source labeling.
- Curated footage will protect the demo from external API failure.
- Next.js app scaffold created in `migratory-dawn/`.
- Sunrise homepage and the primary route shells are now in place.
- The default template has been replaced with a quiet, mobile-first sunrise prototype.
- The visible interface has been localized to Chinese for the product owner.
- Windy camera integration scaffold is now in place on the server.
- `suncalc` is installed so sunrise scoring can happen server-side.
- Windy-backed server routes are implemented with a graceful fallback path when no API key is present.
- The homepage now shows a visible camera media panel instead of only a live-status label.
- When Windy provides a live player URL, the homepage exposes an explicit "打开直播页" link.
- Login, write, inbox, admin, demo, and globe pages now share a working demo data source.
- Sending a letter on `/write` now appears in `/inbox` across page navigation.
- Camera review decisions and demo toggles persist through the shared demo state route.
- The globe page now has a Mapbox-first implementation path with a safe fallback when the token is missing.
- The homepage now prefers the Windy player iframe when a live or time-lapse player URL is available.
- Windy candidate scoring now boosts cameras near the estimated morning band and a curated whitelist.
- Mapbox globe rendering is now verified in the browser when `NEXT_PUBLIC_MAPBOX_TOKEN` is present.
- A Supabase health-check page now reports configuration-only status without exposing secret values.
- Supabase auth request, verify, logout, and profile upsert routes are in place, with a demo fallback when the OTP flow cannot complete.
- Login, send-letter, and inbox flows are now verified in the browser on the local demo path.
- Sending a letter updates the shared inbox immediately and preserves the waiting/flight/read narrative.

## 2. Completed Windy API validation
API key obtained and successfully authorized.

Observed total:
- approximately 73,000 webcams.

Confirmed base fields:
- title
- viewCount
- webcamId
- status
- lastUpdatedOn

Confirmed location fields:
- city
- region
- country
- latitude
- longitude

Confirmed image fields:
- current icon, thumbnail, preview
- daylight icon, thumbnail, preview
- preview size observed: 400 × 224

Confirmed player fields:
- `player.day`
- `player.month`
- `player.year`
- `player.lifetime`
- `player.live` on some cameras

Sample finding:
- one camera in a five-camera sample contained `player.live`;
- all five sample cameras contained `player.day`.

## 3. Confirmed technical conclusions
- Windy can support partial live coverage.
- Not every camera is live.
- Camera direction is not consistently available as a dedicated field.
- Camera-title direction is only a weak heuristic.
- The application needs automatic filtering plus human review.
- Camera source fallback order is:
  1. live
  2. day time-lapse
  3. current image
  4. curated real sunrise video
- Windy API key must stay server-side.
- Supabase checks must accept the public key name supplied by the dashboard, including `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as a safe alias for the anon key slot.

## 4. Local development environment
Machine:
- macOS
- user home appears to be `/Users/lele`

Installed:
- Node.js v23.11.0
- npm 10.9.2

Working npm trust path for this machine:
- use `npm_config_cafile=/etc/ssl/cert.pem` for npm commands that touch the registry
- this keeps certificate verification on while using the system PEM bundle

## 5. Completed bootstrap and verification
Commands that now work:
- `npm_config_cafile=/etc/ssl/cert.pem npm ping`
- `npm run build`
- `npm run dev -- --webpack -H 0.0.0.0 -p 3000`

Verified local URL:
- `http://localhost:3000`

Verified routes:
- `/`
- `/globe`
- `/write`
- `/inbox`
- `/login`
- `/admin/cameras`
- `/demo`
- `/api/cameras/sample`
- `/api/cameras/candidates`
- `/api/current-sunrise`

## 6. Current status
- The Next.js app exists and builds successfully with webpack.
- Turbopack build and dev mode are not used in this environment because they hit a sandbox port-binding error.
- Windy requests now run from server routes and fall back cleanly when `WINDY_API_KEY` is missing.
- The homepage pulls its sunrise snapshot from the shared server-side source function.
- `npm run lint` and `npm run build` both pass on this workspace.
- The first deployment checklist is now written in `docs/DEPLOYMENT.md`.
- The next external step is to sign in to Vercel, import the repository, set production environment variables, and apply the Supabase migration SQL to the external project.
- The Vercel import page is reachable, but it currently stops at the provider sign-in screen because the account is not connected in this browser session.
- The homepage and globe now refresh the sunrise snapshot on a timer so the bird position and current source stay current over time.
- The demo fallback state now persists on the client so production demo sessions survive refreshes on Vercel instead of relying on server memory.
- The login page now surfaces Supabase OTP failure reasons in Chinese instead of silently falling back when the provider rate-limits the request.
- The OTP request endpoint now preserves Supabase status codes, so the UI can distinguish rate limits from other failures.
- The login page now adds a resend cooldown after each OTP request, so repeated taps show an explicit countdown instead of feeling unresponsive.
- The next presentation step is to keep new UI copy in Chinese unless a technical term must stay in English.
