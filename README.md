# Mikhael Rodas — Portfolio & Admin

A responsive Next.js + TypeScript portfolio with Supabase-backed content, owner-only administration, authentication, and media storage. If Supabase is unavailable or not configured, the original portfolio remains visible as a safe read-only fallback.

## Local setup

1. Install dependencies with `npm install`.
2. Create a Supabase project.
3. Copy `.env.example` to `.env.local` and add the project URL, public anon key, and single allowed owner email. Never use a service-role key.
4. In `supabase/migrations/001_portfolio.sql`, replace `YOUR_ADMIN_EMAIL@example.com` with the same owner email, then run the complete file in the Supabase SQL editor. It creates tables, indexes, triggers, RLS policies, storage buckets, storage policies, and initial content migrated from the original site.
5. In Supabase Dashboard → Authentication → Users, choose **Add user**, enter the owner email and a strong password, and confirm the email. Public registration is not implemented; disabling new-user sign-ups in Supabase Auth settings is recommended.
6. Run `npm run dev`. Login is at `/admin/login`; settings are at `/admin/settings`.

## Security model

- Anonymous users can select the profile and visible records and read published media.
- Database and storage mutations require an authenticated JWT email matching the owner email in `is_portfolio_admin()`.
- The server separately compares the user with `ADMIN_EMAIL` before rendering settings.
- Only the public anon key reaches the browser. RLS is the authorization boundary; no service-role key is needed.
- If the owner email changes, update `ADMIN_EMAIL` and the SQL function, then sign in again.

## Storage

The migration creates `portfolio-profile` (5 MB JPG/PNG/WebP), `portfolio-projects` (8 MB JPG/PNG/WebP), and `portfolio-resume` (10 MB PDF). Project images use random UUID filenames to prevent collisions.

## Vercel

Import the repository and add the three variables in `.env.example` under Project Settings → Environment Variables for Production, Preview, and Development as appropriate. Deploy only after the local production build passes. Do not add a service-role key.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

Public content uses a short revalidation interval. Uploaded media has public read URLs; modification remains owner-only through Storage RLS.

## Certifications migration

After the original migration, run `supabase/migrations/002_certifications.sql` in the Supabase SQL editor before deploying this version. It adds project cover-image selection, the RLS-protected `portfolio_certifications` table, and the public-read/admin-write `portfolio-certificates` bucket. Certificate uploads accept PDF, JPG, PNG, and WebP files up to 10 MB and use collision-resistant filenames. Manage records and files from the Certifications tab in `/admin/settings`.
