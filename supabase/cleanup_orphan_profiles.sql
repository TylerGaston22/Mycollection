-- ============================================================
-- Orphan profile cleanup + cascade enforcement
--
-- Symptom: deleting a user from Supabase Auth doesn't free up their
-- username — sign-up complains the username is already taken because
-- the matching public.profiles row stuck around.
--
-- Cause: the FK on public.profiles.id → auth.users(id) was created
-- WITHOUT `on delete cascade`. The schema.sql definition now includes
-- cascade, but `create table if not exists` is a no-op for tables that
-- already exist, so it never amended the live constraint.
--
-- This file:
--   1. Shows you the orphans (read-only, runs as a SELECT below).
--   2. Deletes them.
--   3. Drops + recreates the FK with `on delete cascade` so any future
--      auth.users delete cleans up the profile automatically.
--
-- Safe to re-run.
-- ============================================================

-- Step 1 — Read-only check. Run this query first to see what will be
-- deleted by step 2. Each row here is a profile whose owning auth user
-- no longer exists.
--
--   select id, username, name
--   from public.profiles
--   where id not in (select id from auth.users);
--
-- Uncomment if you want it to print as part of the script.
-- table public.profiles where id not in (select id from auth.users);

-- Step 2 — Delete orphans.
delete from public.profiles
where id not in (select id from auth.users);

-- Step 3 — Re-establish the FK with cascade.
-- Drop whichever name the existing constraint goes by (Supabase's
-- default is usually `profiles_id_fkey`). The if-exists guard makes
-- this safe even if it was already dropped.
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;
