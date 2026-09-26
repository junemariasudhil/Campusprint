-- =====================================================================
-- CampusPrint — Supabase schema, triggers, seed data, and RLS policies
-- =====================================================================
-- Run this once against a fresh Supabase project (SQL Editor, or via the
-- Supabase CLI: `supabase db execute -f supabase/schema.sql`).
-- Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE / ON CONFLICT
-- where practical.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Enum types
-- ---------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('student', 'teacher', 'print_shop', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.shop_approval_status as enum ('APPROVED', 'PENDING', 'SUSPENDED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.colour_mode as enum ('BW', 'COLOUR');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sides_option as enum ('SINGLE', 'DOUBLE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.stapling_option as enum ('NONE', 'STAPLE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.binding_option as enum ('NONE', 'SOFT_SPIRAL', 'HARD_SPIRAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('PENDING', 'SUCCESS', 'FAILED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum (
    'PAYMENT_PENDING', 'QUEUED', 'CANCELLATION_PENDING', 'LOCKED',
    'PRINTING', 'READY', 'COMPLETED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  email      text,
  role       public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists public.print_shops (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  location        text not null,
  active          boolean not null default true,
  approval_status public.shop_approval_status not null default 'PENDING',
  created_at      timestamptz not null default now()
);

create table if not exists public.print_rates (
  id                    uuid primary key default gen_random_uuid(),
  bw_single_page        numeric not null default 1.0,
  bw_double_page        numeric not null default 1.2,
  colour_single_page    numeric not null default 10.0,
  colour_double_page    numeric not null default 15.0,
  staple_fee            numeric not null default 2.0,
  soft_spiral_bind_fee  numeric not null default 50.0,
  hard_spiral_bind_fee  numeric not null default 75.0,
  priority_percentage   numeric not null default 0.10,
  updated_at            timestamptz not null default now()
);

create table if not exists public.print_requests (
  id                     uuid primary key default gen_random_uuid(),
  request_id             text unique,
  user_id                uuid not null references public.profiles (id) on delete cascade,
  print_shop_id          uuid not null references public.print_shops (id),
  document_name          text not null,
  storage_path           text not null,
  page_count             integer not null check (page_count > 0),
  copies                 integer not null check (copies >= 1),
  colour_mode            public.colour_mode not null,
  sides                  public.sides_option not null,
  stapling               public.stapling_option not null default 'NONE',
  binding                public.binding_option not null default 'NONE',
  comments               text,
  preferred_pickup_start text not null,
  preferred_pickup_end   text not null,
  priority               boolean not null default false,
  base_price             numeric not null,
  finishing_price        numeric not null default 0,
  priority_fee           numeric not null default 0,
  total_price            numeric not null,
  payment_status         public.payment_status not null default 'PENDING',
  request_status         public.request_status not null default 'PAYMENT_PENDING',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists print_requests_user_id_idx on public.print_requests (user_id);
create index if not exists print_requests_shop_id_idx on public.print_requests (print_shop_id);
create index if not exists print_requests_status_idx on public.print_requests (request_status);

-- ---------------------------------------------------------------------
-- 3. Auto-generated human-readable request IDs (REQ-1001, REQ-1002, ...)
-- ---------------------------------------------------------------------
create sequence if not exists public.print_request_id_seq start 1001;

create or replace function public.set_request_id()
returns trigger
language plpgsql
as $$
begin
  if new.request_id is null then
    new.request_id := 'REQ-' || nextval('public.print_request_id_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_request_id on public.print_requests;
create trigger trg_set_request_id
  before insert on public.print_requests
  for each row execute function public.set_request_id();

-- ---------------------------------------------------------------------
-- 4. updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_print_requests_updated_at on public.print_requests;
create trigger trg_print_requests_updated_at
  before update on public.print_requests
  for each row execute function public.set_updated_at();

drop trigger if exists trg_print_rates_updated_at on public.print_rates;
create trigger trg_print_rates_updated_at
  before update on public.print_rates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5. Profile auto-creation on signup (email/password or Google OAuth)
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 6. Seed data
-- ---------------------------------------------------------------------
insert into public.print_shops (name, location, active, approval_status)
select 'Main Academic Block Print Center', 'Main Academic Block, Ground Floor', true, 'APPROVED'
where not exists (
  select 1 from public.print_shops where name = 'Main Academic Block Print Center'
);

insert into public.print_shops (name, location, active, approval_status)
select 'Library Annex QuickPrint', 'Library Annex, 1st Floor', true, 'APPROVED'
where not exists (
  select 1 from public.print_shops where name = 'Library Annex QuickPrint'
);

insert into public.print_rates (
  bw_single_page, bw_double_page, colour_single_page, colour_double_page,
  staple_fee, soft_spiral_bind_fee, hard_spiral_bind_fee, priority_percentage
)
select 1.0, 1.2, 10.0, 15.0, 2.0, 50.0, 75.0, 0.10
where not exists (select 1 from public.print_rates);

-- ---------------------------------------------------------------------
-- 7. Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.print_shops enable row level security;
alter table public.print_rates enable row level security;
alter table public.print_requests enable row level security;

-- Helper: is the current user an admin? Relies on the profiles SELECT
-- policy below (a user can always read their own profile row).
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: users manage only their own record
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- print_shops: authenticated users read active shops; admins manage all
drop policy if exists "print_shops_select_active" on public.print_shops;
create policy "print_shops_select_active" on public.print_shops
  for select to authenticated
  using (active = true or public.is_admin());

drop policy if exists "print_shops_admin_write" on public.print_shops;
create policy "print_shops_admin_write" on public.print_shops
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- print_rates: authenticated users read current rates; admins manage all
drop policy if exists "print_rates_select_all" on public.print_rates;
create policy "print_rates_select_all" on public.print_rates
  for select to authenticated
  using (true);

drop policy if exists "print_rates_admin_write" on public.print_rates;
create policy "print_rates_admin_write" on public.print_rates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- print_requests: users see and manage only their own requests
drop policy if exists "print_requests_select_own" on public.print_requests;
create policy "print_requests_select_own" on public.print_requests
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "print_requests_insert_own" on public.print_requests;
create policy "print_requests_insert_own" on public.print_requests
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "print_requests_update_own" on public.print_requests;
create policy "print_requests_update_own" on public.print_requests
  for update to authenticated
  using (
    auth.uid() = user_id
    and request_status in ('QUEUED', 'PAYMENT_PENDING')
  )
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 8. Storage bucket for uploaded documents
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
select 'print-documents', 'print-documents', false
where not exists (select 1 from storage.buckets where id = 'print-documents');

drop policy if exists "print_documents_select_own" on storage.objects;
create policy "print_documents_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'print-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "print_documents_insert_own" on storage.objects;
create policy "print_documents_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'print-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "print_documents_delete_own" on storage.objects;
create policy "print_documents_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'print-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- End of script
-- =====================================================================
