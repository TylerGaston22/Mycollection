-- ============================================================
-- Avatars storage bucket
--
-- Creates a public-read bucket called `avatars` for user profile
-- pictures, plus RLS policies that let each user only upload /
-- update / delete their OWN avatar file.
--
-- File layout: `<user_id>/<unix_timestamp>.<ext>` so the path itself
-- encodes ownership (storage RLS uses the first path segment as the
-- owner check). Old files get orphaned when the user uploads a new
-- avatar — acceptable for now since we don't expect heavy churn;
-- worst case is a few stale files in the bucket.
--
-- Safe to re-run. ============================================================

-- 1. The bucket. Public so img-src can fetch the URL without an
--    authenticated request; we still gate WRITES via RLS.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- 2. RLS — anyone can read (bucket is public), only the owning user
--    can write to their own folder.

drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
