-- ============================================================
-- Recommendations schema
--
-- Lets a user send any one of their items to a friend with an
-- optional note. The recipient sees pending recommendations in the
-- FriendsDialog and can either "Add to my collection" (creates a
-- new collection_items row, status defaults to 'want-to-see') or
-- "Dismiss" (drops the row).
--
-- Tables added:
--   - public.recommendations
--
-- Why item_snapshot (jsonb) instead of a foreign key to
-- collection_items.id?
--   - The sender might later delete their own collection_items row.
--     Snapshotting the title/year/poster keeps the recommendation
--     stable regardless.
--   - It also means the receiver isn't reading the sender's
--     collection_items row (which would otherwise require the friend-
--     read RLS shipped with friendships.sql + visibility="friends").
--
-- RLS:
--   - SELECT either party (from_user_id or to_user_id)
--   - INSERT only as yourself, status must start as 'pending'
--   - UPDATE only the recipient (so they can flip pending → added/dismissed)
--   - DELETE either party
--
-- Safe to re-run.
-- ============================================================

create table if not exists public.recommendations (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references auth.users(id) on delete cascade not null,
  to_user_id   uuid references auth.users(id) on delete cascade not null,
  -- Snapshot of the recommended item at send time. Expected keys:
  --   title (required), type, year, posterUrl, genre, platform, studio,
  --   seasons, episodes, notes
  item_snapshot jsonb not null,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recommendations_no_self check (from_user_id <> to_user_id),
  constraint recommendations_status_check check (status in ('pending', 'added', 'dismissed'))
);

-- One pending row per (sender, recipient, item title) — prevents
-- accidentally spamming the same item over and over. Uses a partial
-- unique index keyed on the lowercased title in the snapshot.
drop index if exists idx_recommendations_unique_pending;
create unique index idx_recommendations_unique_pending
  on public.recommendations (
    from_user_id,
    to_user_id,
    lower(item_snapshot->>'title')
  )
  where status = 'pending';

-- Index for the common "list recs sent to me" query
create index if not exists idx_recommendations_to_user
  on public.recommendations(to_user_id, status);
create index if not exists idx_recommendations_from_user
  on public.recommendations(from_user_id);

alter table public.recommendations enable row level security;

drop policy if exists "Users can read recommendations they're part of" on public.recommendations;
create policy "Users can read recommendations they're part of"
  on public.recommendations for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

drop policy if exists "Users can send recommendations as themselves" on public.recommendations;
create policy "Users can send recommendations as themselves"
  on public.recommendations for insert
  with check (
    auth.uid() = from_user_id
    and status = 'pending'
  );

-- Only the recipient can flip pending → added/dismissed.
drop policy if exists "Recipient can update recommendation status" on public.recommendations;
create policy "Recipient can update recommendation status"
  on public.recommendations for update
  using (auth.uid() = to_user_id);

drop policy if exists "Users can delete their own recommendation rows" on public.recommendations;
create policy "Users can delete their own recommendation rows"
  on public.recommendations for delete
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);
