# TECHNICAL.md — Architecture and implementation plan

## 1. Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- Mapbox GL JS
- SunCalc
- Vercel
- npm

## 2. High-level architecture

Browser
→ Next.js pages and client components
→ Next.js server route handlers
→ Windy Webcams API / Supabase / Mapbox

The browser must never call Windy using the private API key.

## 3. Environment variables
Local `.env.local`:

```env
WINDY_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

Rules:
- Never commit `.env.local`.
- Service role key is server-only.
- Windy key is server-only.
- Public Supabase anon key or publishable key and public Mapbox token may be exposed only according to provider design and with appropriate restrictions.

## 4. Windy API integration
Confirmed endpoint family:
`/webcams/api/v3/webcams`

Authentication header:
`x-windy-api-key`

Observed behavior:
- base request returns camera metadata;
- `include=location` returns coordinates;
- `include=images` returns current and daylight images;
- `include=player` returns time-lapse players and, for some cameras, live player.

Because the documentation UI appeared to allow only one include choice at a time, implementation should verify whether the actual HTTP API accepts multiple include values. If not, use:
- multiple requests;
- camera-detail requests if available;
- server-side merging by `webcamId`.

Do not assume multiple include syntax before testing it in code.

## 5. Camera data model
Normalized server model:

```ts
type CameraSource = {
  webcamId: number;
  title: string;
  status: string;
  lastUpdatedOn: string;
  viewCount?: number;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    countryCode?: string;
    latitude: number;
    longitude: number;
  };
  images?: {
    current?: {
      icon?: string;
      thumbnail?: string;
      preview?: string;
    };
    daylight?: {
      icon?: string;
      thumbnail?: string;
      preview?: string;
    };
  };
  player?: {
    live?: string;
    day?: string;
    month?: string;
    year?: string;
    lifetime?: string;
  };
};
```

## 6. Server routes
Initial routes:
- `GET /api/cameras/sample`
- `GET /api/cameras/candidates`
- `GET /api/current-sunrise`
- `POST /api/admin/cameras/:id/review`

Later:
- letter routes handled directly through Supabase with RLS where appropriate;
- protected demo route.

## 7. Sunrise calculations
Use SunCalc for each candidate:
- `getTimes(date, lat, lng)`
- `getPosition(date, lat, lng)`
- compare solar altitude now and ten minutes later.

Candidate conditions:
- time delta from local sunrise within configurable window;
- solar altitude near horizon;
- later altitude greater than current altitude.

Do not infer sunrise merely from local clock time.

## 8. Geographic retrieval strategy
Do not request all cameras.

MVP options, in order:
1. Query cameras near estimated morning terminator zones if Windy filtering supports it.
2. Query a maintained set of geographic bounding areas.
3. Use a manually curated whitelist across longitudes.
4. Cache normalized candidates for a short interval.

The first implementation may use a small curated set for reliability, then add dynamic querying.

## 9. Fallback engine
For every content request:
1. ranked live candidates;
2. ranked day-player candidates;
3. ranked current-image candidates;
4. curated local or hosted sunrise video.

Each source must have:
- load timeout;
- error callback;
- next-source transition;
- truthful label.

## 10. Admin camera review
Persistence fields:
- webcam_id
- review_state: keep / backup / reject
- quality_score
- direction_hint
- notes
- reviewed_at

MVP storage may be Supabase or a local JSON file during the first prototype, but final deployed MVP should persist review decisions.

## 11. Supabase schema

### profiles
- id UUID references auth.users
- nickname
- bird_code unique
- home_city
- home_country
- home_latitude
- home_longitude
- created_at

### letters
- id UUID
- sender_id
- recipient_id nullable for unassigned random delivery
- delivery_mode
- content
- origin_city
- origin_latitude
- origin_longitude
- destination_city
- destination_latitude
- destination_longitude
- pickup_at
- deliver_at
- read_at
- parent_letter_id
- created_at

### camera_reviews
- webcam_id
- state
- score_override
- direction_hint
- notes
- updated_at

### sunrises — reserved for later
- id
- user_id
- media_url
- media_type
- latitude
- longitude
- city
- country
- captured_at
- rights_confirmed
- moderation_status
- created_at

## 12. Letter status
Prefer computed status:
- now < pickup_at → waiting
- pickup_at <= now < deliver_at → in_flight
- deliver_at <= now and read_at null → arrived
- read_at not null → read

Avoid background job dependency for MVP status transitions.

## 13. Security
- Enable RLS on all user-owned tables.
- Sender and recipient may read direct letters.
- Only sender may create a letter as themselves.
- Only recipient may set read status.
- Admin functions require a protected role.
- Never expose precise home coordinates publicly.
- Do not log secrets.
- Sanitize user text before rendering.

## 14. Deployment
- Git repository
- Vercel project
- environment variables configured in Vercel
- Supabase production project
- HTTPS public URL
- mobile verification

## 15. Five-day implementation sequence
Day 1:
- repair npm environment;
- create Next.js app;
- add context documents;
- create Windy server route;
- render sample cameras.

Day 2:
- camera normalization;
- sunrise scoring;
- fallback player;
- admin review prototype.

Day 3:
- Mapbox globe;
- bird position;
- current camera marker.

Day 4:
- Supabase;
- login;
- profiles and bird codes;
- direct and random letters.

Day 5:
- mobile polish;
- demo mode;
- fallbacks;
- deployment;
- rehearsal.

## 16. Current technical blocker
`npx create-next-app@latest migratory-dawn --yes` failed with:

`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`

Safe troubleshooting order:
1. inspect npm proxy and registry settings;
2. inspect VPN or network interception;
3. test `npm ping`;
4. try another trusted network;
5. inspect custom CA configuration;
6. consider switching to an LTS Node version if needed.

Do not permanently disable `strict-ssl`.
