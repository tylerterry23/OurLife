-- Let the invite code itself be sufficient to join a couple, instead of
-- also requiring the accepting account's email to match invitee_email
-- exactly. The code is an unguessable random 8-char secret already, so
-- the email match was redundant friction, not real security — and it
-- blocked sharing an invite via QR code / text message to whatever
-- email or device the partner actually has open.
--
-- invitee_email is left in place purely as a record of who was invited
-- and to power the "invites addressed to you" listing; it's no longer
-- an enforced gate on acceptance.

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

  if v_invite.inviter_id = auth.uid() then
    raise exception 'You cannot accept your own invite.';
  end if;

  -- Leave any existing couple (enforces one-partner-at-a-time).
  delete from couple_members where user_id = auth.uid();

  insert into couple_members (user_id, couple_id)
  values (auth.uid(), v_invite.couple_id);

  update couple_invites
  set status = 'accepted', responded_at = now()
  where id = v_invite.id;

  -- Auto-close any other pending invites sent to the same email, since
  -- whoever redeemed this code has now committed to this couple.
  update couple_invites
  set status = 'cancelled', responded_at = now()
  where lower(invitee_email) = lower(v_invite.invitee_email)
    and status = 'pending'
    and id <> v_invite.id;
end;
$$;

grant execute on function accept_couple_invite(text) to authenticated;
