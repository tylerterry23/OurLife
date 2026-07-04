import { supabase } from './supabaseClient'

// couple_members' RLS policy returns every row for the caller's own couple
// (including the caller), so a single unfiltered select yields both
// members once a couple exists — no need to look up "my" couple_id first.
let cachedMemberIds: string[] | null = null

export async function getCoupleMemberIds(): Promise<string[]> {
  if (cachedMemberIds) return cachedMemberIds
  const { data, error } = await supabase.from('couple_members').select('user_id')
  if (error) throw error
  cachedMemberIds = data.map((row) => row.user_id)
  return cachedMemberIds
}

export async function getMyCoupleId(): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_my_couple_id')
  if (error) throw error
  return data
}

export async function getPartnerUserId(myUserId: string): Promise<string | null> {
  const memberIds = await getCoupleMemberIds()
  return memberIds.find((id) => id !== myUserId) ?? null
}

// Call after any action that changes couple membership (accepting/leaving
// a couple) so the next read reflects it instead of a stale cache.
export function clearCoupleCache() {
  cachedMemberIds = null
}
