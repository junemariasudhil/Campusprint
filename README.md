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
  schema.sql               Core schema, triggers, seed data, and RLS policies
  002_print_shop_role.sql  Print shop role/access + Realtime
  003_demo_data.sql        Demo account promotion for a live walkthrough
```

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run, in order:
   1. [`supabase/schema.sql`](supabase/schema.sql) — all tables, enums, the `handle_new_user` profile trigger,
      the `REQ-XXXX` request-id trigger, seed data (two print shops + starter rates), Row Level Security
      policies, and the private `print-documents` storage bucket with its access policies.
   2. [`supabase/002_print_shop_role.sql`](supabase/002_print_shop_role.sql) — adds the print shop
      operator role and enables Realtime on `print_requests`.
   Both are safe to re-run.
3. Under **Authentication → Providers**, enable:
   - **Email** (already on by default) — used for the prototype's email/password fallback. **Turn off
     "Confirm email"** here for demo purposes — Supabase's built-in test email sender is rate-limited to a
     couple of sends per hour, which will block back-to-back demo sign-ups otherwise. Without confirmation,
     `signUp()` logs the user in immediately.
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

`VITE_DEMO_MULTI_TAB_SESSIONS=true` isolates each browser tab's login session (per-tab `sessionStorage` +
a unique auth storage key), so you can be signed in as different users in separate tabs at once — handy for a
multi-role demo. Set it back to `false` for normal single-user use (sessions then persist across reloads as usual).

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

The **print shop** role additionally needs `profiles.print_shop_id` set to the shop it operates (see
`supabase/002_print_shop_role.sql`). A print-shop account signs in and lands on `/print-shop`, a live queue of
every request for its shop, updating in real time via Supabase Realtime — no manual refresh needed.

## Demo walkthrough (3 students + 1 print shop)

See [`supabase/003_demo_data.sql`](supabase/003_demo_data.sql) to promote a `printshop@demo.local` account after
signing it up once through the app. Then, with 4 browser tabs (multi-tab sessions enabled):

1. Tabs 1–3: sign in as `student1@demo.local` / `student2@demo.local` / `student3@demo.local`.
2. Tab 4: sign in as `printshop@demo.local` — lands on the live queue at `/print-shop`.
3. In tab 1: **+ New Print Request** → upload a PDF → configure it → pick **Main Academic Block Print
   Center** (the shop `003_demo_data.sql` links the demo operator to) → watch the price breakdown compute
   live from `print_rates` → **Simulate Successful Payment**.
4. Switch to tab 4 — the request appears in the queue instantly (Realtime), no refresh.
5. Repeat from tabs 2 and 3 (try toggling Priority on one) to show the queue reorder by pickup slot →
   priority → submission time.
6. In tab 4, click through **Start printing → Mark ready for pickup → Mark completed** and watch each
   student's Dashboard badge update live in its own tab.
