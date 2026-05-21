-- ============================================================
-- Username constraints for the profiles table
--
-- Supports the new username-only signup flow:
--   - Users who don't link an email pick a unique username + password
--   - Internally we synthesise an email (`<username>@no-email.mycollection.local`)
--     so Supabase Auth still has an identifier to key off of
--
-- This script:
--   1. Strips legacy '@'-prefix from existing usernames (was auto-generated
--      from the email local-part; doesn't fit the new rules).
--   2. Lowercases all usernames to normalise case.
--   3. Enforces format: 3-30 chars, [a-z0-9_-], no '@', 'demo' reserved.
--   4. Enforces case-insensitive uniqueness on non-empty usernames.
--
-- Safe to re-run.
-- ============================================================

-- 1. Migrate legacy '@'-prefixed usernames (strip the leading '@')
update public.profiles
set username = lower(ltrim(username, '@'))
where username like '@%';

-- 2. Lowercase any other existing usernames so the unique index is meaningful
update public.profiles
set username = lower(username)
where username <> lower(username);

-- 3. Drop existing constraints/indexes (idempotent)
alter table public.profiles drop constraint if exists profiles_username_format;
drop index if exists profiles_username_lower_unique;

-- 4. Format check: empty allowed (existing legacy rows), otherwise must be
--    3-30 lowercase alphanumeric / underscore / dash and not 'demo'
alter table public.profiles
  add constraint profiles_username_format
  check (
    username = ''
    OR (
      char_length(username) between 3 and 30
      AND username ~ '^[a-z0-9_-]+$'
      AND username <> 'demo'
    )
  );

-- 5. Case-insensitive uniqueness (only on non-empty usernames so multiple
--    legacy rows with empty usernames don't collide)
create unique index profiles_username_lower_unique
  on public.profiles (lower(username))
  where username <> '';
