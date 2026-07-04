-- Clean rebuild of the entire public schema.
--
-- Replaces an earlier live-patched schema that had diverged from what was
-- documented: couple_members' own SELECT policy queried couple_members in
-- a subquery, which Postgres cannot resolve (infinite recursion), and that
-- recursion cascaded into every table whose policy checked couple
-- membership. Several data tables also still carried a leftover
-- "authenticated users full access" policy alongside the new couple-scoped
-- one. All app tables were empty at rebuild time, so this drops and
-- recreates from scratch rather than patching in place.

-- ============================================================
-- DROP EXISTING (safe: all tables empty at time of rebuild)
-- ============================================================

drop table if exists rating_scores cascade;
drop table if exists ratings cascade;
drop table if exists places cascade;
drop table if exists important_dates cascade;
drop table if exists quiz_questions cascade;
drop table if exists wishlist_items cascade;
drop table if exists couple_invites cascade;
drop table if exists couple_members cascade;
drop table if exists couples cascade;

drop function if exists create_couple_and_invite(text);
drop function if exists accept_couple_invite(text);
drop function if exists decline_couple_invite(text);
drop function if exists leave_couple();
drop function if exists get_my_couple_id();

-- ============================================================
-- COUPLES CORE
-- ============================================================

create table couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- user_id as the PRIMARY KEY (not couple_id + user_id) is what enforces
-- "one couple per person" at the database level.
create table couple_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid not null references couples(id) on delete cascade,
  joined_at timestamptz not null default now()
);

create index couple_members_couple_id_idx on couple_members(couple_id);

create table couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_email text not null,
  invite_code text unique not null default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index couple_invites_invitee_email_idx on couple_invites(lower(invitee_email));
create index couple_invites_couple_id_idx on couple_invites(couple_id);

-- ============================================================
-- Helper: get_my_couple_id()
--
-- SECURITY DEFINER + owned by the table owner (postgres), and these
-- tables do not have FORCE ROW LEVEL SECURITY set, so the query inside
-- this function bypasses RLS entirely. That's what avoids the recursion:
-- policies call this function instead of subquerying couple_members
-- directly from within couple_members' own policy.
-- ============================================================

create or replace function get_my_couple_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select couple_id from couple_members where user_id = auth.uid();
$$;

grant execute on function get_my_couple_id() to authenticated;

-- ============================================================
-- RLS: couples
-- ============================================================

alter table couples enable row level security;
grant all on couples to anon, authenticated;

create policy "members can view their couple" on couples
  for select
  using (id = get_my_couple_id());

-- No insert/update/delete policy: couples are only ever created through
-- create_couple_and_invite() below.

-- ============================================================
-- RLS: couple_members
-- ============================================================

alter table couple_members enable row level security;
grant all on couple_members to anon, authenticated;

create policy "users can view members of their own couple" on couple_members
  for select
  using (couple_id = get_my_couple_id());

-- No direct write policy: membership changes only happen through the
-- accept_couple_invite() and leave_couple() RPCs below.

-- ============================================================
-- RLS: couple_invites
-- ============================================================

alter table couple_invites enable row level security;
grant all on couple_invites to anon, authenticated;

create policy "inviter can view invites they sent" on couple_invites
  for select
  using (inviter_id = auth.uid());

create policy "invitee can view invites addressed to them" on couple_invites
  for select
  using (lower(invitee_email) = lower(auth.jwt() ->> 'email'));

create policy "inviter can cancel their own pending invite" on couple_invites
  for update
  using (inviter_id = auth.uid() and status = 'pending')
  with check (inviter_id = auth.uid() and status in ('pending','cancelled'));

-- No insert policy: invite creation only happens through
-- create_couple_and_invite() below, alongside couple creation atomically.

-- ============================================================
-- RPC: create_couple_and_invite
-- ============================================================

create or replace function create_couple_and_invite(p_invitee_email text)
returns table (invite_id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple_id uuid;
  v_invite_id uuid;
  v_invite_code text;
begin
  if exists (select 1 from couple_members where user_id = auth.uid()) then
    raise exception 'You are already in a couple. Leave your current couple before inviting someone new.';
  end if;

  if lower(p_invitee_email) = lower(auth.jwt() ->> 'email') then
    raise exception 'You cannot invite yourself.';
  end if;

  insert into couples default values
  returning id into v_couple_id;

  insert into couple_members (user_id, couple_id)
  values (auth.uid(), v_couple_id);

  insert into couple_invites (couple_id, inviter_id, invitee_email)
  values (v_couple_id, auth.uid(), lower(p_invitee_email))
  returning id, couple_invites.invite_code into v_invite_id, v_invite_code;

  return query select v_invite_id, v_invite_code;
end;
$$;

grant execute on function create_couple_and_invite(text) to authenticated;

-- ============================================================
-- RPC: accept_couple_invite
-- ============================================================

create or replace function accept_couple_invite(p_invite_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite couple_invites%rowtype;
begin
  select * into v_invite
  from couple_invites
  where invite_code = p_invite_code
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Invite not found or already resolved.';
  end if;

  if lower(v_invite.invitee_email) <> lower(auth.jwt() ->> 'email') then
    raise exception 'This invite was not sent to your account email.';
  end if;

  -- Leave any existing couple (enforces one-partner-at-a-time).
  delete from couple_members where user_id = auth.uid();

  insert into couple_members (user_id, couple_id)
  values (auth.uid(), v_invite.couple_id);

  update couple_invites
  set status = 'accepted', responded_at = now()
  where id = v_invite.id;

  -- Auto-close any other pending invites sent to this email.
  update couple_invites
  set status = 'cancelled', responded_at = now()
  where lower(invitee_email) = lower(auth.jwt() ->> 'email')
    and status = 'pending'
    and id <> v_invite.id;
end;
$$;

grant execute on function accept_couple_invite(text) to authenticated;

-- ============================================================
-- RPC: decline_couple_invite
-- ============================================================

create or replace function decline_couple_invite(p_invite_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update couple_invites
  set status = 'declined', responded_at = now()
  where invite_code = p_invite_code
    and status = 'pending'
    and lower(invitee_email) = lower(auth.jwt() ->> 'email');

  if not found then
    raise exception 'Invite not found or already resolved.';
  end if;
end;
$$;

grant execute on function decline_couple_invite(text) to authenticated;

-- ============================================================
-- RPC: leave_couple
-- ============================================================

create or replace function leave_couple()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from couple_members where user_id = auth.uid();
end;
$$;

grant execute on function leave_couple() to authenticated;

-- ============================================================
-- DATA TABLES
--
-- All carry couple_id not null from creation (no ALTER-then-backfill
-- needed since the whole schema is empty at rebuild time), and share one
-- RLS policy per table gated on get_my_couple_id().
-- ============================================================

create table ratings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  category text not null,
  title text not null,
  note text,
  created_at timestamptz not null default now()
);

create index ratings_couple_id_idx on ratings(couple_id);

-- Scores are per-member rows instead of named tyler_score/lauren_score
-- columns, so the table works for any couple, not just the original two.
create table rating_scores (
  rating_id uuid not null references ratings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score numeric,
  primary key (rating_id, user_id)
);

create table places (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  name text not null,
  status text not null,
  city text,
  notes text,
  created_at timestamptz not null default now()
);

create index places_couple_id_idx on places(couple_id);

create table important_dates (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  label text not null,
  date date not null,
  recurring boolean not null default false
);

create index important_dates_couple_id_idx on important_dates(couple_id);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  asked_by text not null,
  question text not null,
  answer text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

create index quiz_questions_couple_id_idx on quiz_questions(couple_id);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  added_by text not null,
  title text not null,
  url text,
  notes text,
  claimed boolean not null default false,
  created_at timestamptz not null default now()
);

create index wishlist_items_couple_id_idx on wishlist_items(couple_id);

-- ============================================================
-- RLS: data tables
-- ============================================================

alter table ratings enable row level security;
grant all on ratings to anon, authenticated;

create policy "couple members full access" on ratings
  for all
  using (couple_id = get_my_couple_id())
  with check (couple_id = get_my_couple_id());

alter table rating_scores enable row level security;
grant all on rating_scores to anon, authenticated;

create policy "couple members full access" on rating_scores
  for all
  using (rating_id in (select id from ratings where couple_id = get_my_couple_id()))
  with check (rating_id in (select id from ratings where couple_id = get_my_couple_id()));

alter table places enable row level security;
grant all on places to anon, authenticated;

create policy "couple members full access" on places
  for all
  using (couple_id = get_my_couple_id())
  with check (couple_id = get_my_couple_id());

alter table important_dates enable row level security;
grant all on important_dates to anon, authenticated;

create policy "couple members full access" on important_dates
  for all
  using (couple_id = get_my_couple_id())
  with check (couple_id = get_my_couple_id());

alter table quiz_questions enable row level security;
grant all on quiz_questions to anon, authenticated;

create policy "couple members full access" on quiz_questions
  for all
  using (couple_id = get_my_couple_id())
  with check (couple_id = get_my_couple_id());

alter table wishlist_items enable row level security;
grant all on wishlist_items to anon, authenticated;

create policy "couple members full access" on wishlist_items
  for all
  using (couple_id = get_my_couple_id())
  with check (couple_id = get_my_couple_id());
