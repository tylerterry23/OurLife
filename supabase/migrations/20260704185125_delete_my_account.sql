-- Self-serve account deletion. The client SDK has no permission to delete
-- from auth.users directly (and never should, via the anon/authenticated
-- roles) — this SECURITY DEFINER function, owned by postgres, is the
-- standard Supabase pattern for letting a user delete only their own row
-- without exposing the service_role key to the client.
--
-- Cascades: profiles, couple_members, rating_scores (own scores), and
-- couple_invites the user sent all reference auth.users(id) on delete
-- cascade, so those clean up automatically. Shared couple data (ratings,
-- places, dates, quiz, wishlist) is keyed by couple_id, not user_id, so it
-- correctly stays intact for the remaining partner. Avatar files in
-- storage are not referenced by a foreign key and are not cleaned up here.

create or replace function delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function delete_my_account() to authenticated;
