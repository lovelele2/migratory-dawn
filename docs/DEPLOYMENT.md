# DEPLOYMENT.md — First deployment checklist

## Goal
Deploy Migratory Dawn to Vercel with the real production environment variables and a live Supabase project.

## What is already ready
- `npm run lint` passes.
- `npm run build` passes with webpack.
- The app has local fallback paths for Windy, Supabase auth, and camera review.
- Secrets are kept out of browser-visible code.

## Required environment variables on Vercel
Set these in the Vercel project settings:

- `WINDY_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY` if you want authenticated server writes to use the service role

If your Supabase dashboard shows the public key as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, that is also accepted by this app.

## Supabase setup
1. Create or open your production Supabase project.
2. Apply the SQL in `supabase/migrations/0001_initial_schema.sql`.
3. Verify that the `profiles`, `letters`, and `camera_reviews` tables exist.
4. Confirm that RLS is enabled.
5. Make sure the auth redirect URLs include the deployed Vercel domain.

## Vercel setup
1. Open the Vercel project import page.
2. Sign in with your Vercel account.
3. Import the Git repository for this app.
4. Add the environment variables listed above.
5. Deploy the project.

## Post-deploy verification
Check these paths on the public HTTPS site:

- `/`
- `/globe`
- `/login`
- `/write`
- `/inbox`
- `/admin/cameras`

Expected result:
- The homepage renders a real sunrise camera or a safe fallback.
- The globe loads.
- Login shows the Chinese UI.
- Letters save and appear in inbox.
- No secret values are visible in the page source or UI.

## If deployment stops at sign-in
That means the Vercel account still needs to be connected in the browser. No app code change is required for that step.
