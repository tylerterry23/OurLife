import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { clearCoupleCache } from '@/lib/coupleContext'
import {
  DEMO_PARTNER_USER_ID,
  readDemoIdentity,
  writeDemoIdentity,
} from '@/lib/demoIdentity'
import type { RelationshipStatus } from '../types'

export interface CoupleStatus {
  inCouple: boolean
  coupleId: string | null
  partnerUserId: string | null
  relationshipStatus: RelationshipStatus | null
}

export interface UserSearchResult {
  userId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

export interface IncomingRequest {
  inviteId: string
  fromUserId: string
  fromUsername: string | null
  fromDisplayName: string | null
  fromAvatarUrl: string | null
  createdAt: string
}

export interface OutgoingRequest {
  inviteId: string
  inviteCode: string
  // Set only for the legacy email/QR path; username-based requests have no
  // email on file, and email invites have no target profile (recipient
  // doesn't exist as a user yet).
  inviteeEmail: string | null
  toUserId: string | null
  toUsername: string | null
  toDisplayName: string | null
  toAvatarUrl: string | null
  createdAt: string
}

export async function getMyCoupleStatus(): Promise<CoupleStatus> {
  if (!isSupabaseConfigured) {
    return {
      inCouple: true,
      coupleId: 'demo-couple',
      partnerUserId: DEMO_PARTNER_USER_ID,
      relationshipStatus: readDemoIdentity().relationshipStatus,
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      inCouple: false,
      coupleId: null,
      partnerUserId: null,
      relationshipStatus: null,
    }
  }

  // couples RLS returns only the caller's couple; couple_members returns
  // both members — one round trip each, resolved together.
  const [couplesRes, membersRes] = await Promise.all([
    supabase.from('couples').select('id, status'),
    supabase.from('couple_members').select('user_id'),
  ])
  if (couplesRes.error) throw couplesRes.error
  if (membersRes.error) throw membersRes.error

  const couple = couplesRes.data[0]
  if (!couple) {
    return {
      inCouple: false,
      coupleId: null,
      partnerUserId: null,
      relationshipStatus: null,
    }
  }

  const partner = membersRes.data.find((m) => m.user_id !== user.id)
  return {
    inCouple: true,
    coupleId: couple.id,
    partnerUserId: partner?.user_id ?? null,
    relationshipStatus: couple.status as RelationshipStatus,
  }
}

export async function setCoupleRelationshipStatus(
  coupleId: string,
  status: RelationshipStatus
): Promise<void> {
  if (!isSupabaseConfigured) {
    writeDemoIdentity({ relationshipStatus: status })
    return
  }

  const { error } = await supabase
    .from('couples')
    .update({ status })
    .eq('id', coupleId)
  if (error) throw error
}

// Exact-match only, by design: prevents anyone from enumerating usernames
// by probing partial strings. Returns null rather than throwing when
// nobody matches, since "not found" is an expected, common result here.
export async function findUserByUsername(
  username: string
): Promise<UserSearchResult | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase.rpc('find_user_by_username', {
    p_username: username,
  })
  if (error) throw error
  const row = data[0]
  if (!row) return null
  return {
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  }
}

export async function sendCoupleRequest(
  username: string
): Promise<UserSearchResult & { inviteId: string }> {
  if (!isSupabaseConfigured) {
    throw new Error('Connecting isn’t available in demo mode.')
  }

  const { data, error } = await supabase.rpc('send_couple_request', {
    p_username: username,
  })
  if (error) throw error
  const row = data[0]
  clearCoupleCache()
  return {
    inviteId: row.invite_id,
    userId: row.target_user_id,
    username: row.target_username,
    displayName: row.target_display_name,
    avatarUrl: row.target_avatar_url,
  }
}

export async function acceptCoupleRequest(inviteId: string): Promise<void> {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.rpc('accept_couple_request', {
    p_invite_id: inviteId,
  })
  if (error) throw error
  clearCoupleCache()
}

export async function declineCoupleRequest(inviteId: string): Promise<void> {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.rpc('decline_couple_request', {
    p_invite_id: inviteId,
  })
  if (error) throw error
  clearCoupleCache()
}

export async function cancelCoupleRequest(inviteId: string): Promise<void> {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.rpc('cancel_couple_request', {
    p_invite_id: inviteId,
  })
  if (error) throw error
  clearCoupleCache()
}

export async function getIncomingRequests(): Promise<IncomingRequest[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase.rpc('get_incoming_couple_requests')
  if (error) throw error
  return data.map((row) => ({
    inviteId: row.invite_id,
    fromUserId: row.inviter_user_id,
    fromUsername: row.inviter_username,
    fromDisplayName: row.inviter_display_name,
    fromAvatarUrl: row.inviter_avatar_url,
    createdAt: row.created_at,
  }))
}

export async function getOutgoingRequests(): Promise<OutgoingRequest[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase.rpc('get_outgoing_couple_requests')
  if (error) throw error
  return data.map((row) => ({
    inviteId: row.invite_id,
    inviteCode: row.invite_code,
    inviteeEmail: row.invitee_email,
    toUserId: row.target_user_id,
    toUsername: row.target_username,
    toDisplayName: row.target_display_name,
    toAvatarUrl: row.target_avatar_url,
    createdAt: row.created_at,
  }))
}

export async function invitePartner(
  email: string
): Promise<{ inviteId: string; inviteCode: string }> {
  if (!isSupabaseConfigured) {
    return { inviteId: crypto.randomUUID(), inviteCode: 'DEMO1234' }
  }

  const { data, error } = await supabase.rpc('create_couple_and_invite', {
    p_invitee_email: email,
  })
  if (error) throw error
  const row = data[0]
  clearCoupleCache()
  return { inviteId: row.invite_id, inviteCode: row.invite_code }
}

export async function acceptInvite(inviteCode: string): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await supabase.rpc('accept_couple_invite', {
    p_invite_code: inviteCode,
  })
  if (error) throw error
  clearCoupleCache()
}

export async function declineInvite(inviteCode: string): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await supabase.rpc('decline_couple_invite', {
    p_invite_code: inviteCode,
  })
  if (error) throw error
}

export async function leavePartner(): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await supabase.rpc('leave_couple')
  if (error) throw error
  clearCoupleCache()
}
