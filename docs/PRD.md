# PRD — 候鸟逐日 / Migratory Dawn

**Version:** 0.2 frozen MVP scope  
**Product form:** Mobile-first responsive Web App  
**Development window:** Five days  
**Stage:** Hackathon MVP

## 1. Product statement
No matter when or where a person opens the product, they should be able to see a real sunrise occurring somewhere on Earth, or the closest truthful fallback when a live sunrise source is unavailable.

A migratory bird follows the moving sunrise boundary around the globe. It connects real places, real dawn imagery, and messages sent between people.

## 2. Product vision
Create an always-open window onto dawn somewhere in the world.

The product should make sunrise feel:
- real rather than synthetic;
- planetary rather than local;
- quiet rather than attention-seeking;
- relational rather than purely scenic.

## 3. Core principles

### 3.1 Truthfulness
Every visual source must be labeled accurately:
- `LIVE` only when `player.live` exists and plays successfully;
- `Real-time camera image` for the latest still image;
- `Today time-lapse` for `player.day`;
- `Curated real sunrise footage` for fallback recordings.

No prerecorded or time-lapse content may be described as live.

### 3.2 Sunrise continuity
The homepage should never fail into a blank state. Content fallback order:

1. Verified live player near sunrise
2. Today time-lapse near sunrise
3. Latest camera image near sunrise
4. Curated real sunrise video

### 3.3 Weak social interaction
The product should not center on followers, likes, popularity, public profiles, or feeds.

The core social action is sending and receiving a letter carried by the bird.

### 3.4 The bird is a narrative agent
The bird is not decorative. It:
- follows dawn;
- visually links locations;
- collects letters at sunrise;
- delivers them to another location or user.

## 4. MVP goals
The five-day MVP must demonstrate:

1. A functioning sunrise homepage
2. Real Windy Webcams API integration
3. Correct distinction between live, time-lapse, still image, and curated video
4. Geographic sunrise filtering
5. A globe showing the bird and current content location
6. User authentication
7. Direct letters to a specified user
8. Optional random delivery
9. Message states based on pickup and delivery time
10. Public HTTPS deployment

## 5. Target users
Primary users:
- people interested in travel, nature, photography, cities, letters, and quiet emotional expression;
- hackathon judges and visitors who need to understand the product within 30 seconds.

## 6. Main user journey

### Journey A — Watch the current dawn
1. User opens the product.
2. The homepage immediately shows the best available real dawn source.
3. The interface shows:
   - place;
   - local time;
   - source type;
   - source attribution;
   - bird status.
4. User may open the globe to see where the bird currently is.

### Journey B — Send a direct letter
1. User signs in.
2. User enters another user's bird code.
3. User writes a letter of up to 300 Chinese characters or equivalent.
4. User selects or confirms origin city.
5. System calculates the origin's next sunrise.
6. Letter status becomes `waiting_for_sunrise`.
7. At pickup time it becomes `in_flight`.
8. At destination delivery time it becomes `arrived`.
9. Recipient sees the letter in the inbox.

### Journey C — Send a random letter
1. User chooses random delivery.
2. System assigns an eligible recipient.
3. Letter follows the same pickup and arrival narrative.
4. No permanent chat thread is created.

## 7. Information architecture
Primary pages:

1. `/` — Sunrise homepage
2. `/globe` — Globe and bird
3. `/write` — Compose letter
4. `/inbox` — Received and sent letters
5. `/login` — Email login
6. `/admin/cameras` — Camera review and whitelist tool
7. `/demo` — Demo-only controls, protected from normal users

User-upload sunrise page is postponed but data structures should be reserved.

## 8. Functional requirements

### 8.1 Sunrise homepage
Must display:
- full-screen visual source;
- location;
- local time;
- source label;
- Windy or original-source attribution;
- a minimal bird status line;
- entry points to globe and letters.

Must support:
- autoplay where browser rules permit;
- muted playback by default;
- loading state;
- source timeout;
- automatic fallback;
- mobile layout.

### 8.2 Camera acquisition
The backend retrieves Windy webcam records using the server-side API key.

Confirmed available fields:
- `title`
- `viewCount`
- `webcamId`
- `status`
- `lastUpdatedOn`
- `location.city`
- `location.region`
- `location.country`
- `location.latitude`
- `location.longitude`
- `images.current`
- `images.daylight`
- `player.live` on some cameras
- `player.day`
- `player.month`
- `player.year`
- `player.lifetime`

Observed total camera count: approximately 73,000.

### 8.3 Camera filtering
The system must not rely on popularity ranking alone.

Filtering logic:
1. Select geographic zones near the estimated morning terminator.
2. Request a manageable number of cameras per zone.
3. Exclude cameras with:
   - inactive status;
   - missing coordinates;
   - stale updates;
   - no usable source;
   - failed embed or image load.
4. Calculate solar conditions using SunCalc:
   - local sunrise time;
   - current solar altitude;
   - solar altitude shortly later;
   - solar azimuth.
5. Keep only cameras near sunrise where the sun is rising.
6. Score remaining cameras.
7. Prefer cameras on the curated whitelist.
8. Try sources in descending score order.
9. Fall back to curated footage if all fail.

Initial scoring:
- within 30 minutes of sunrise: +40
- sun rising: +20
- valid `player.live`: +25
- valid `player.day`: +10
- updated within five minutes: +10
- title suggests east or southeast: +5 only as a weak hint
- manually approved scenic quality: +20

### 8.4 Camera review page
`/admin/cameras` should show ranked cards with:
- current preview;
- city and country;
- sunrise distance;
- source types;
- update freshness;
- score;
- buttons: Keep, Backup, Reject.

This page is for human aesthetic review after automatic filtering.

### 8.5 Globe and bird
The globe must show:
- current bird position;
- current sunrise source;
- approved camera locations;
- origin and destination for an active letter.

MVP accuracy:
- visually aligned with the dawn region;
- not represented as scientific-grade migration tracking.

### 8.6 Authentication
Use email one-time-password login.

Each profile includes:
- user ID;
- nickname;
- unique bird code;
- home city;
- created time.

### 8.7 Letters
Fields:
- sender;
- recipient;
- delivery mode: `direct` or `random`;
- origin city and coordinates;
- destination city and coordinates;
- content;
- pickup time;
- delivery time;
- read time;
- parent letter if used as reply.

Statuses:
- `waiting_for_sunrise`
- `in_flight`
- `arrived`
- `read`

Direct letters are visible only to sender and recipient.

### 8.8 Demo mode
A protected demo account may use `simulate immediate delivery`.

Normal users must not see this control.

## 9. Deferred feature — user-uploaded sunrise
Not included in five-day delivery, but reserve:
- sunrise table;
- uploader user ID;
- media URL;
- media type;
- captured location;
- captured time;
- moderation status;
- rights confirmation;
- source type.

Future acceptance criteria:
1. Signed-in user uploads image or video.
2. User enters place and capture time.
3. User confirms usage rights.
4. Media uploads to storage.
5. Database record is created.
6. Default status is pending.
7. Approved content can appear on homepage or globe.
8. Rejected content remains private.

## 10. Non-functional requirements
- Mobile-first
- Public HTTPS deployment
- Secrets server-side only
- Graceful fallback for third-party failures
- No precise home address exposure
- Supabase row-level security
- Source attribution
- Fast initial meaningful paint
- Curated fallback available during demo

## 11. Explicitly out of scope for five-day MVP
- Native iOS or Android app
- App Store release
- payment
- followers and public social graph
- instant messaging
- push notifications
- AI-generated sunrise
- automatic AI camera-orientation detection
- full moderation dashboard
- scientific bird migration simulation
- global exhaustive webcam crawling
- user-facing sunrise upload page

## 12. Acceptance criteria

### Sunrise
- Homepage always shows a valid source or curated fallback.
- Source type is labeled truthfully.
- Live failure automatically triggers another source.

### Camera logic
- Backend reads Windy data.
- Coordinates are available.
- Sunrise and sunset are distinguished.
- Ranked candidates are produced.
- Whitelist decisions persist.

### Globe
- Interactive globe renders.
- Bird marker renders.
- Current sunrise source location renders.
- Bird position changes over time.

### Letters
- User can sign in.
- User has a bird code.
- User can address a specific bird code.
- Letter persists.
- Status transitions are calculable.
- Recipient can read the letter.
- Other users cannot read it.

### Deployment
- Public HTTPS URL works on mobile and desktop.
- Secrets are absent from browser source and repository.
