-- Real per-user profile data (display name, relationship status, avatar),
-- replacing what was previously local-only zustand state with no backend
-- persistence at all — it never survived a new device or browser.

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text,
  status text not null default 'dating' check (
    status in ('dating', 'engaged', 'married', 'situationship', 'its_complicated')
  ),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_username_idx on profiles (lower(username)) where username is not null;

alter table profiles enable row level security;
grant all on profiles to anon, authenticated;

-- Couple members can see each other's profile (needed to show a partner's
-- name/avatar), but only the row owner can ever write it.
create policy "self and couple members can view profiles" on profiles
  for select
  using (
    user_id = auth.uid()
    or user_id in (select user_id from couple_members where couple_id = get_my_couple_id())
  );

create policy "users can create their own profile" on profiles
  for insert
  with check (user_id = auth.uid());

create policy "users can update their own profile" on profiles
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- Avatar storage
--
-- Public bucket (profile pictures aren't sensitive) with object paths
-- namespaced as avatars/{user_id}/{filename} — the folder-name check in
-- the write policies is what keeps one user from overwriting another's.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "users can upload their own avatar" on storage.objects
  for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can update their own avatar" on storage.objects
  for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can delete their own avatar" on storage.objects
  for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
