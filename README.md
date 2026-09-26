# CampusPrint

A college campus print-order management prototype, built for a Design Thinking course.
React + TypeScript (strict) + Tailwind CSS on the frontend, Supabase (Auth, Postgres, Storage, RLS) on the backend.

## Stack

- React 19 + Vite, TypeScript strict mode
- Tailwind CSS v4
- Supabase (`@supabase/supabase-js`)
- React Router
- Lucide React icons
- pdf-lib (client-side PDF page counting)

## Project structure

```
src/
  types/       TypeScript interfaces & union types
  lib/         Supabase client + generic helpers
  services/    Database queries, storage uploads, pricing calculations
  components/  Reusable UI (buttons, cards, badges, layout, protected routes)
  pages/       Login, Dashboard, Admin, and the multi-step request flow
supabase/
  schema.sql   Full schema, triggers, seed data, and RLS policies
```

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run the entire contents of [`supabase/schema.sql`](supabase/schema.sql). It is safe to re-run.
   This creates all tables, enums, the `handle_new_user` profile trigger, the `REQ-XXXX` request-id trigger,
   seed data (two print shops + starter rates), Row Level Security policies, and the private
   `print-documents` storage bucket with its access policies.
3. Under **Authentication → Providers**, enable:
   - **Email** (already on by default) — used for the prototype's email/password fallback.
   - **Google** — add your OAuth client ID/secret. Set the redirect URL to your app's origin
     (e.g. `http://localhost:5173` for local dev).
4. Under **Authentication → URL Configuration**, add `http://localhost:5173` to the allowed redirect URLs.

Google sign-in works with any Google account for prototype convenience. Accounts whose email does not end in
`@rajagiri.edu.in` are let in but shown a friendly warning badge on the dashboard — sign-in is never blocked.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**.

## 3. Install and run

```bash
npm install
npm run dev
```

## Scope (prototype boundaries)

- No AI features (no document parsing, no queue optimization).
- No real payment gateway — Step 5 of the request flow is a mock
  "Simulate Successful Payment" / "Simulate Failed Payment" toggle.
- No physical printer/hardware integration.
- Each uploaded PDF is its own isolated print request with a unique `REQ-XXXX` id.
- All pricing is computed from the `print_rates` table (via `src/services/pricingService.ts`), never hardcoded
  in components.
- Row Level Security stays on for every table; the anon key alone cannot bypass it.

## Roles

New sign-ups default to `student` via the `handle_new_user` database trigger. Roles are never chosen from the
UI — they live only in `profiles.role`. To create an admin for testing, update that row's `role` to `'admin'`
directly in the Supabase table editor.
