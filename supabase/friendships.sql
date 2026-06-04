-- ============================================================
-- Friend system schema
--
-- Lets users send each other friend requests and (when accepted)
-- view each other's collection_items read-only.
--
-- Tables / columns added:
--   - public.friendships         — the directional request rows
--   - public.profiles.list_visibility — owner's visibility choice
--
-- RLS additions:
--   - friendships: read either party, insert as requester, update
--     as addressee (accept/decline), delete either party
--   - collection_items: existing owner-read policy stays; NEW policy
--     adds read access for accepted friends when visibility allows
--
-- RPC:
--   - search_users_by_username(query)  — username lookup that bypasses
--     the strict profiles RLS but returns only safe public fields.
--
-- Safe to re-run (every CREATE has a paired DROP IF EXISTS).
-- ============================================================

-- 1. list_visibility column on profiles
-- Default is 'friends' (current product policy: new accounts share by
-- default, can toggle to private in Settings). Existing installs that
-- predate this change should run supabase/default_visibility_to_friends.sql
-- to flip the column default + backfill existing rows.
alter table public.profiles
  add column if not exists list_visibility text not null default 'friends';

alter table public.profiles drop constraint if exists profiles_list_visibility_check;
alter table public.profiles
  add constraint profiles_list_visibility_check
  check (list_visibility in ('private', 'friends'));

-- 2. friendships table
create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references auth.users(id) on delete cascade not null,
  addressee_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Can't friend yourself
  constraint friendships_no_self check (requester_id <> addressee_id),
  -- Only one pair in either direction
  constraint friendships_unique_pair unique (requester_id, addressee_id),
  -- Restrict status to known values
  constraint friendships_status_check check (status in ('pending', 'accepted', 'blocked'))
);

-- Index for the common "list my friends" query
create index if not exists idx_friendships_requester on public.friendships(requester_id);
create index if not exists idx_friendships_addressee on public.friendships(addressee_id);

alter table public.friendships enable row level security;

drop policy if exists "Users can read friendships they're part of" on public.friendships;
create policy "Users can read friendships they're part of"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Users can send friend requests as themselves" on public.friendships;
create policy "Users can send friend requests as themselves"
  on public.friendships for insert
  with check (
    auth.uid() = requester_id
    and status = 'pending'
  );

-- Addressee can accept/decline/block; requester can also update (e.g. cancel).
-- We don't restrict the new status here — RLS checks who, not what.
drop policy if exists "Users can update their own friendship rows" on public.friendships;
create policy "Users can update their own friendship rows"
  on public.friendships for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Either party can unfriend / cancel
drop policy if exists "Users can delete their own friendship rows" on public.friendships;
create policy "Users can delete their own friendship rows"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 3. Friend-read policy on profiles
-- Lets users read the profile (name/username) of anyone they share a
-- friendship row with — any status, so pending-request senders/receivers
-- can resolve each other's display info. Without this, the existing
-- "Users can read their own profile" policy hides the counterparty's
-- name and the FriendsDialog drops the row at the decorate step.
drop policy if exists "Users can read profiles of friendship counterparts" on public.profiles;
create policy "Users can read profiles of friendship counterparts"
  on public.profiles for select
  using (
    exists (
      select 1 from public.friendships f
      where (f.requester_id = auth.uid() and f.addressee_id = profiles.id)
         or (f.addressee_id = auth.uid() and f.requester_id = profiles.id)
    )
  );

-- 4. Friend-read policy on collection_items
-- Allows reading another user's items IF (a) we're accepted friends and
-- (b) they've set list_visibility = 'friends'.
drop policy if exists "Friends can read items when visibility allows" on public.collection_items;
create policy "Friends can read items when visibility allows"
  on public.collection_items for select
  using (
    -- Owner already has the existing self-read policy; this adds friend access
    exists (
      select 1
      from public.friendships f
      join public.profiles p on p.id = collection_items.user_id
      where f.status = 'accepted'
        and p.list_visibility = 'friends'
        and (
          (f.requester_id = auth.uid() and f.addressee_id = collection_items.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = collection_items.user_id)
        )
    )
  );

-- 5. RPC: search users by username (returns safe public fields only)
-- Runs with security definer so unauthenticated calls work too — but the
-- function itself checks auth.uid() so only signed-in users get results.
create or replace function public.search_users_by_username(query text)
returns table (id uuid, name text, username text)
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  if char_length(coalesce(trim(query), '')) < 2 then
    return;
  end if;

  return query
  select p.id, p.name, p.username
  from public.profiles p
  where
    p.username <> ''
    and lower(p.username) like '%' || lower(trim(query)) || '%'
    and p.id <> auth.uid()
  order by p.username
  limit 20;
end;
$$;

-- Make sure the function is callable by the standard authenticated role
grant execute on function public.search_users_by_username(text) to authenticated;
