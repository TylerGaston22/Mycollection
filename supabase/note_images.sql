-- ============================================================
-- Note images — screenshots attached to a collection item's notes
--
-- Two parts:
--   1. `note_images text[]` on collection_items, holding the public
--      URLs of the uploaded screenshots (mirrors how `sections text[]`
--      stores an array of ids on the same row).
--   2. A public-read `note-images` storage bucket with per-user write
--      RLS, exactly like the `avatars` bucket in avatars_storage.sql.
--
-- File layout: `<user_id>/<unix_timestamp>-<random>.<ext>` so the path
-- itself encodes ownership (storage RLS checks the first path segment).
-- Removing an image from a note, or deleting the item, leaves the file
-- orphaned in the bucket — the same tradeoff avatars_storage.sql takes.
-- Worst case is a few stale objects; nothing references them.
--
-- Safe to re-run. ============================================================

-- 1. The column. `add column if not exists` so this upgrades an existing
--    database — schema.sql's `create table if not exists` would not.
alter table public.collection_items
  add column if not exists note_images text[] default '{}';

-- 2. The bucket. Public so <img src> can fetch the URL without an
--    authenticated request; WRITES are still gated by RLS below.
insert into storage.buckets (id, name, public)
values ('note-images', 'note-images', true)
on conflict (id) do update set public = excluded.public;

-- 3. RLS — anyone can read (bucket is public), only the owning user can
--    write into their own folder.

drop policy if exists "Note images are publicly readable" on storage.objects;
create policy "Note images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'note-images');

drop policy if exists "Users can upload their own note images" on storage.objects;
create policy "Users can upload their own note images"
  on storage.objects for insert
  with check (
    bucket_id = 'note-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own note images" on storage.objects;
create policy "Users can update their own note images"
  on storage.objects for update
  using (
    bucket_id = 'note-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete their own note images" on storage.objects;
create policy "Users can delete their own note images"
  on storage.objects for delete
  using (
    bucket_id = 'note-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
