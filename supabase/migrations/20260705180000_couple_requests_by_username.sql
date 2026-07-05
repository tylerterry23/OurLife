-- Pairing today is 100% out-of-band: type a partner's email, get an 8-char
-- code + QR, and relay it to them yourself (text, in-person scan). There is
-- no in-app discovery. This adds a second, primary path: search someone's
-- exact username and send them an in-app connect request, like a follow
-- request — they see it and accept/decline without you having to relay
-- anything. The email/code/QR flow stays as-is for inviting someone who
-- isn't on OurLife yet (username search can't find an account that
-- doesn't exist).
--
-- Search is exact-match only (not prefix/live search) so nobody can
-- enumerate usernames by probing partial strings.

alter table couple_invites
  add column invitee_user_id uuid references auth.users(id) on delete cascade;

create index couple_invites_invitee_user_id_idx
  on couple_invites(invitee_user_id);

-- invitee_email was "not null" because every invite used to be addressed
-- by email; username-based requests address the invitee by id instead.
alter table couple_invites
  alter column invitee_email drop not null;

create policy "invitee can view requests addressed to their account" on couple_invites
  for select
  using (invitee_user_id = auth.uid());

-- ============================================================
-- RPC: find_user_by_username
-- Exact-match lookup used to preview a search result before sending a
-- request. Excludes the caller so you can't "find" yourself.
-- ============================================================

create or replace function find_user_by_username(p_username text)
returns table (user_id uuid, username text, display_name text, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select user_id, username, display_name, avatar_url
  from profiles
  where lower(username) = lower(p_username)
    and user_id <> auth.uid()
  limit 1;
$$;

grant execute on function find_user_by_username(text) to authenticated;

-- ============================================================
-- RPC: send_couple_request
-- ============================================================

create or replace function send_couple_request(p_username text)
returns table (
  invite_id uuid,
  target_user_id uuid,
  target_username text,
  target_display_name text,
  target_avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target profiles%rowtype;
  v_couple_id uuid;
  v_invite_id uuid;
begin
  if exists (select 1 from couple_members where user_id = auth.uid()) then
    raise exception 'You are already in a couple. Leave your current couple before connecting with someone new.';
  end if;

  select * into v_target
  from profiles
  where lower(username) = lower(p_username);

  if not found then
    raise exception 'No one found with that username.';
  end if;

  if v_target.user_id = auth.uid() then
    raise exception 'You cannot connect with yourself.';
  end if;

  if exists (select 1 from couple_members where user_id = v_target.user_id) then
    raise exception 'That person is already connected with someone.';
  end if;

  if exists (
    select 1 from couple_invites
    where status = 'pending'
      and ((inviter_id = auth.uid() and invitee_user_id = v_target.user_id)
        or (inviter_id = v_target.user_id and invitee_user_id = auth.uid()))
  ) then
    raise exception 'There is already a pending request between you and this person.';
  end if;

  insert into couples default values
  returning id into v_couple_id;

  insert into couple_members (user_id, couple_id)
  values (auth.uid(), v_couple_id);

  insert into couple_invites (couple_id, inviter_id, invitee_user_id, invitee_email)
  values (v_couple_id, auth.uid(), v_target.user_id, null)
  returning id into v_invite_id;

  return query
    select v_invite_id, v_target.user_id, v_target.username,
           v_target.display_name, v_target.avatar_url;
end;
$$;

grant execute on function send_couple_request(text) to authenticated;

-- ============================================================
-- RPC: accept_couple_request
-- ============================================================

create or replace function accept_couple_request(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite couple_invites%rowtype;
  v_orphan_couple_ids uuid[];
begin
  select * into v_invite
  from couple_invites
  where id = p_invite_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Request not found or already resolved.';
  end if;

  if v_invite.invitee_user_id is distinct from auth.uid() then
    raise exception 'This request was not sent to you.';
  end if;

  delete from couple_members where user_id = auth.uid();

  insert into couple_members (user_id, couple_id)
  values (auth.uid(), v_invite.couple_id);

  update couple_invites
  set status = 'accepted', responded_at = now()
  where id = v_invite.id;

  -- Any other pending request involving me (sent to me, or sent by me to
  -- someone else) is now moot since I've committed to this couple. Those
  -- requests eagerly created their own couple shell when sent, so tear
  -- those down too — otherwise the other party would be stuck "in a
  -- couple" that never actually formed.
  select array_agg(couple_id) into v_orphan_couple_ids
  from couple_invites
  where status = 'pending'
    and id <> v_invite.id
    and (invitee_user_id = auth.uid() or inviter_id = auth.uid());

  update couple_invites
  set status = 'cancelled', responded_at = now()
  where status = 'pending'
    and id <> v_invite.id
    and (invitee_user_id = auth.uid() or inviter_id = auth.uid());

  if v_orphan_couple_ids is not null then
    delete from couple_members where couple_id = any(v_orphan_couple_ids);
    delete from couples where id = any(v_orphan_couple_ids);
  end if;
end;
$$;

grant execute on function accept_couple_request(uuid) to authenticated;

-- ============================================================
-- RPC: decline_couple_request
-- ============================================================

create or replace function decline_couple_request(p_invite_id uuid)
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
  where id = p_invite_id
    and status = 'pending'
    and invitee_user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Request not found or already resolved.';
  end if;

  update couple_invites
  set status = 'declined', responded_at = now()
  where id = v_invite.id;

  -- Tear down the couple shell the sender's request eagerly created, so
  -- they aren't stuck "in a couple" and can send or accept a new request.
  delete from couple_members where couple_id = v_invite.couple_id;
  delete from couples where id = v_invite.couple_id;
end;
$$;

grant execute on function decline_couple_request(uuid) to authenticated;

-- ============================================================
-- RPC: cancel_couple_request (sender changes their mind)
-- ============================================================

create or replace function cancel_couple_request(p_invite_id uuid)
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
  where id = p_invite_id
    and status = 'pending'
    and inviter_id = auth.uid()
  for update;

  if not found then
    raise exception 'Request not found or already resolved.';
  end if;

  update couple_invites
  set status = 'cancelled', responded_at = now()
  where id = v_invite.id;

  delete from couple_members where couple_id = v_invite.couple_id;
  delete from couples where id = v_invite.couple_id;
end;
$$;

grant execute on function cancel_couple_request(uuid) to authenticated;

-- ============================================================
-- RPC: get_incoming_couple_requests / get_outgoing_couple_requests
-- Surface the other party's public profile info alongside each pending
-- request, since direct profiles RLS only allows seeing your own row or
-- your current partner's — not someone you're not yet connected to.
-- ============================================================

create or replace function get_incoming_couple_requests()
returns table (
  invite_id uuid,
  inviter_user_id uuid,
  inviter_username text,
  inviter_display_name text,
  inviter_avatar_url text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select ci.id, p.user_id, p.username, p.display_name, p.avatar_url, ci.created_at
  from couple_invites ci
  join profiles p on p.user_id = ci.inviter_id
  where ci.invitee_user_id = auth.uid()
    and ci.status = 'pending'
  order by ci.created_at desc;
$$;

grant execute on function get_incoming_couple_requests() to authenticated;

create or replace function get_outgoing_couple_requests()
returns table (
  invite_id uuid,
  invite_code text,
  invitee_email text,
  target_user_id uuid,
  target_username text,
  target_display_name text,
  target_avatar_url text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select ci.id, ci.invite_code, ci.invitee_email,
         p.user_id, p.username, p.display_name, p.avatar_url,
         ci.created_at
  from couple_invites ci
  left join profiles p on p.user_id = ci.invitee_user_id
  where ci.inviter_id = auth.uid()
    and ci.status = 'pending'
  order by ci.created_at desc;
$$;

grant execute on function get_outgoing_couple_requests() to authenticated;
