-- =====================================================================
-- CampusPrint — Demo account promotion
-- =====================================================================
-- This script does NOT create auth users — Supabase auth users must go
-- through the real sign-up flow (the app's email/password form accepts
-- any address for testing convenience, so this is quick).
--
-- Step 1 — in the app, sign up 4 times (use "Sign up" tab, any password):
--   student1@demo.local
--   student2@demo.local
--   student3@demo.local
--   printshop@demo.local
-- Each sign-up auto-creates a `profiles` row via the handle_new_user
-- trigger, defaulting to role = 'student'.
--
-- Step 2 — run the block below to promote the print shop account and
-- link it to one of the two seeded shops. Students need no changes;
-- they stay as 'student' and are ready to submit requests.
-- =====================================================================

update public.profiles
set role = 'print_shop',
    print_shop_id = (
      select id from public.print_shops
      where name = 'Main Academic Block Print Center'
    )
where email = 'printshop@demo.local';

-- Sanity check — should show 4 rows: 3 students, 1 print_shop with a
-- non-null print_shop_id.
select id, email, role, print_shop_id
from public.profiles
where email in (
  'student1@demo.local',
  'student2@demo.local',
  'student3@demo.local',
  'printshop@demo.local'
);

-- =====================================================================
-- End of script
-- =====================================================================
