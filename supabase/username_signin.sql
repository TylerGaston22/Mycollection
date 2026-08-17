-- ============================================================
-- Sign in with EITHER email or username (todo X)
--
-- Problem: accounts created with a real email were given an EMPTY
-- profiles.username on purpose — handle_new_user only copied whatever the
-- client put in raw_user_meta_data, and the email signup path deliberately
-- sent ''. So those accounts have no username to sign in with. What the
-- Settings screen shows them is a display-only fallback: loadProfile does
-- `data.username || localPart`, so the email's local part is rendered as
-- though it were a stored username. It isn't.
--
-- This script:
--   1. Backfills a username for existing email accounts, where a safe,
--      unambiguous, unclaimed candidate exists.
--   2. Updates handle_new_user so NEW email signups claim one at creation.
--
-- Both halves refuse to guess: if a candidate is malformed, reserved, or
-- already taken, the username is left empty rather than mangled into
-- something the user didn't choose. Those users keep signing in by email
-- and can set a username in Settings.
--
-- Uniqueness is already guaranteed by profiles_username_lower_unique in
-- username_constraints.sql (case-insensitive, non-empty rows only). Run
-- that FIRST if it hasn't been applied. Nothing here weakens it.
--
-- Safe to re-run: step 1 only touches rows where username = ''.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Backfill existing accounts
-- ------------------------------------------------------------
with candidates as (
  select
    p.id,
    -- Local part, minus any '+tag', lowercased, with characters the format
    -- constraint rejects folded to '_' ("jon.snow" -> "jon_snow").
    regexp_replace(
      lower(split_part(split_part(u.email, '@', 1), '+', 1)),
      '[^a-z0-9_-]', '_', 'g'
    ) as candidate
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username = ''
    and u.email is not null
    -- Username-only accounts already have a username; their synthetic
    -- address is not a real mailbox and must never be mined for one.
    and u.email not like '%@no-email.mycollection.local'
),
valid as (
  select id, candidate
  from candidates
  where char_length(candidate) between 3 and 30
    and candidate ~ '^[a-z0-9_-]+$'
    -- 'demo' is blocked by the DB check constraint; the rest mirror
    -- RESERVED_USERNAMES in src/auth/username.ts.
    and candidate not in ('demo', 'admin', 'root', 'system', 'support')
),
claimable as (
  select v.id, v.candidate
  from valid v
  -- Not already owned by someone else...
  where not exists (
    select 1 from public.profiles p2
    where p2.username <> ''
      and lower(p2.username) = v.candidate
  )
  -- ...and not wanted by two different accounts in this same batch
  -- (e.g. jon.snow@a.com and jon_snow@b.com both fold to "jon_snow").
  -- Ambiguous cases are skipped entirely; nobody gets an arbitrary winner.
  and (select count(*) from valid v2 where v2.candidate = v.candidate) = 1
)
update public.profiles p
set username = c.candidate
from claimable c
where p.id = c.id;

-- ------------------------------------------------------------
-- 2. New email signups claim a username at creation
-- ------------------------------------------------------------
-- Done in the trigger rather than the client so the check-and-claim is a
-- single transaction against the unique index. Doing it client-side would
-- be a read-then-write race.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  desired_username text;
  candidate text;
begin
  desired_username := coalesce(new.raw_user_meta_data->>'username', '');

  -- Only auto-claim when the client didn't supply one (email signups).
  -- Username signups already sent an explicit, validated choice.
  if desired_username = ''
     and new.email is not null
     and new.email not like '%@no-email.mycollection.local'
  then
    candidate := regexp_replace(
      lower(split_part(split_part(new.email, '@', 1), '+', 1)),
      '[^a-z0-9_-]', '_', 'g'
    );

    if char_length(candidate) between 3 and 30
       and candidate ~ '^[a-z0-9_-]+$'
       and candidate not in ('demo', 'admin', 'root', 'system', 'support')
       and not exists (
         select 1 from public.profiles
         where username <> '' and lower(username) = candidate
       )
    then
      desired_username := candidate;
    end if;
  end if;

  begin
    insert into public.profiles (id, name, username)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', ''),
      desired_username
    );
  exception when unique_violation then
    -- Lost a race for the username between the check above and the insert.
    -- Signup must still succeed: fall back to an empty username, which the
    -- user can set later in Settings. Never fail account creation over a
    -- nicety.
    insert into public.profiles (id, name, username)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), '');
  end;

  return new;
end;
$$ language plpgsql security definer;

-- ------------------------------------------------------------
-- 3. Verify (read-only — run separately and eyeball the output)
-- ------------------------------------------------------------
-- Who has a username now, and who was skipped and why:
--
--   select
--     u.email,
--     p.username,
--     case
--       when p.username <> '' then 'has username'
--       when u.email like '%@no-email.mycollection.local' then 'username-only account'
--       else 'skipped: candidate invalid, reserved, or taken'
--     end as status
--   from public.profiles p
--   join auth.users u on u.id = p.id
--   order by status, u.email;
