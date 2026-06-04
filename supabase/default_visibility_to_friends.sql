-- ============================================================
-- Flip default list_visibility from 'private' → 'friends'
--
-- Originally the friendships.sql migration set the column default
-- to 'private' so users had to opt in. New product policy is the
-- inverse — accounts default to sharing with friends, users can
-- toggle to private in Settings if they want.
--
-- This file:
--   1. Changes the column DEFAULT so future profile rows start as
--      'friends'.
--   2. Flips any existing rows currently sitting at 'private' over
--      to 'friends'. (If you want to preserve users' active choices,
--      comment out step 2 — but most existing rows are at the
--      original default, not an explicit choice.)
--
-- Safe to re-run.
-- ============================================================

-- 1. New default for new profiles
alter table public.profiles
  alter column list_visibility set default 'friends';

-- 2. Flip existing 'private' rows
update public.profiles
  set list_visibility = 'friends'
  where list_visibility = 'private';
