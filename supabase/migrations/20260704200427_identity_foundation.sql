-- Identity foundation overhaul.
--
-- Three problems this fixes:
--  1. A new user's chosen display name / username never reached their
--     profile: the client only wrote them after signup returned a session,
--     but with email confirmation on there is no session yet, so they were
--     silently dropped. Fixed with a trigger that builds the profile row
--     from signup metadata at the moment auth.users gets the row — before
--     any email round-trip.
--  2. Relationship status lived on each person's profile, so partners could
--     hold contradictory statuses. It's inherently a property of the couple,
--     so it moves to the couples table, settable by either member.
--  3. Usernames are unique but RLS hides other users' rows, so nothing could
--     tell a user their pick was taken until an ugly DB error. Added a
--     security-definer availability check.

-- ============================================================
-- 1. Auto-create profile from signup metadata
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into profiles (user_id, display_name, username)
    values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'username', '')
    );
  exception when unique_violation then
    -- Username collided; still create the profile so the account works,
    -- just without the username. They can set a fresh one from Profile.
    insert into profiles (user_id, display_name)
    values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  end;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 2. Relationship status is a couple property
-- ============================================================

alter table couples
  add column status text not null default 'dating'
  check (status in ('dating', 'engaged', 'married', 'situationship', 'its_complicated'));

-- Members may update their own couple's row (only status is user-facing;
-- id/created_at aren't editable from the client in practice).
create policy "members can update their couple" on couples
  for update
  using (id = get_my_couple_id())
  with check (id = get_my_couple_id());

alter table profiles drop column status;

-- ============================================================
-- 3. Username availability
-- ============================================================

create or replace function is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from profiles where lower(username) = lower(p_username)
  );
$$;

grant execute on function is_username_available(text) to anon, authenticated;
