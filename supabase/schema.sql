-- ============================================================
-- My Collection – Supabase database schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
--
-- This script is idempotent: tables use `create table if not exists`,
-- policies use `drop ... if exists` + `create`, and the trigger is
-- dropped before being recreated. Safe to re-run.
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  username text not null default '',
  bio text not null default '',
  location text not null default '',
  profile_image text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'username', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it already exists, then create it
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Collection items table
create table if not exists public.collection_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text not null,
  year text,
  poster_url text,
  status text not null default 'want-to-see',
  rating integer check (rating is null or (rating >= 1 and rating <= 5)),
  favorite boolean not null default false,
  notes text,
  platform text,
  studio text,
  genre text,
  seasons integer,
  episodes integer,
  sections text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.collection_items enable row level security;

drop policy if exists "Users can read their own items" on public.collection_items;
create policy "Users can read their own items"
  on public.collection_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own items" on public.collection_items;
create policy "Users can insert their own items"
  on public.collection_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own items" on public.collection_items;
create policy "Users can update their own items"
  on public.collection_items for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own items" on public.collection_items;
create policy "Users can delete their own items"
  on public.collection_items for delete
  using (auth.uid() = user_id);

-- 3. Custom tabs table
create table if not exists public.custom_tabs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default 'Star',
  created_at timestamptz not null default now()
);

alter table public.custom_tabs enable row level security;

drop policy if exists "Users can read their own tabs" on public.custom_tabs;
create policy "Users can read their own tabs"
  on public.custom_tabs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tabs" on public.custom_tabs;
create policy "Users can insert their own tabs"
  on public.custom_tabs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tabs" on public.custom_tabs;
create policy "Users can update their own tabs"
  on public.custom_tabs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own tabs" on public.custom_tabs;
create policy "Users can delete their own tabs"
  on public.custom_tabs for delete
  using (auth.uid() = user_id);

-- 4. Custom sections table
create table if not exists public.custom_sections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  content_type text not null,
  created_at timestamptz not null default now()
);

alter table public.custom_sections enable row level security;

drop policy if exists "Users can read their own sections" on public.custom_sections;
create policy "Users can read their own sections"
  on public.custom_sections for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own sections" on public.custom_sections;
create policy "Users can insert their own sections"
  on public.custom_sections for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sections" on public.custom_sections;
create policy "Users can update their own sections"
  on public.custom_sections for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own sections" on public.custom_sections;
create policy "Users can delete their own sections"
  on public.custom_sections for delete
  using (auth.uid() = user_id);

-- 5. User preferences table
create table if not exists public.preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  background_colors jsonb not null default '{"movie":"current","tv-show":"current","restaurant":"current","place":"current"}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.preferences enable row level security;

drop policy if exists "Users can read their own preferences" on public.preferences;
create policy "Users can read their own preferences"
  on public.preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own preferences" on public.preferences;
create policy "Users can insert their own preferences"
  on public.preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own preferences" on public.preferences;
create policy "Users can update their own preferences"
  on public.preferences for update
  using (auth.uid() = user_id);

-- 6. Indexes for common queries
create index if not exists idx_collection_items_user_id on public.collection_items(user_id);
create index if not exists idx_collection_items_type on public.collection_items(user_id, type);
create index if not exists idx_custom_tabs_user_id on public.custom_tabs(user_id);
create index if not exists idx_custom_sections_user_id on public.custom_sections(user_id);
