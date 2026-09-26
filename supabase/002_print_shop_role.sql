-- =====================================================================
-- CampusPrint — Print Shop role support
-- =====================================================================
-- Run this once after supabase/schema.sql. Adds a print_shop_id link on
-- profiles, RLS so print-shop staff can see (and act on) requests for
-- their own shop, and enables Realtime replication on print_requests so
-- the shop queue and student dashboard update live.
-- Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Link a profile to the shop it operates (only meaningful when
--    profiles.role = 'print_shop')
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists print_shop_id uuid references public.print_shops (id);

-- ---------------------------------------------------------------------
-- 2. Helper: which shop (if any) does the current user operate?
-- ---------------------------------------------------------------------
create or replace function public.my_print_shop_id()
returns uuid
language sql
stable
as $$
  select print_shop_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 3. print_requests: shop staff can see and update requests for their shop
-- ---------------------------------------------------------------------
drop policy if exists "print_requests_select_shop_staff" on public.print_requests;
create policy "print_requests_select_shop_staff" on public.print_requests
  for select to authenticated
  using (print_shop_id = public.my_print_shop_id());

drop policy if exists "print_requests_update_shop_staff" on public.print_requests;
create policy "print_requests_update_shop_staff" on public.print_requests
  for update to authenticated
  using (print_shop_id = public.my_print_shop_id())
  with check (print_shop_id = public.my_print_shop_id());

-- ---------------------------------------------------------------------
-- 4. profiles: shop staff can look up the name/email of a student who has
--    a request at their shop (needed to show "who to call for pickup")
-- ---------------------------------------------------------------------
drop policy if exists "profiles_select_by_shop_staff" on public.profiles;
create policy "profiles_select_by_shop_staff" on public.profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.print_requests r
      where r.user_id = profiles.id
        and r.print_shop_id = public.my_print_shop_id()
    )
  );

-- ---------------------------------------------------------------------
-- 5. Realtime: broadcast changes on print_requests so the shop queue and
--    the student dashboard update live without a manual refresh.
--    (Realtime still respects the RLS policies above and on profiles.)
-- ---------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.print_requests;
exception when duplicate_object then null; end $$;

-- =====================================================================
-- End of script
-- =====================================================================
