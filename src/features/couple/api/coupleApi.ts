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

export interface CoupleInvite {
  id: string
  inviteCode: string
  inviterId: string
  inviteeEmail: string
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

// couple_invites' RLS returns rows the caller sent OR rows addressed to
// their email — split by inviter_id to tell the two apart client-side.
export async function getMyInvites(): Promise<{
  sent: CoupleInvite[]
  received: CoupleInvite[]
}> {
  if (!isSupabaseConfigured) return { sent: [], received: [] }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { sent: [], received: [] }

  const { data, error } = await supabase
    .from('couple_invites')
    .select('id, invite_code, inviter_id, invitee_email, created_at')
    .eq('status', 'pending')
  if (error) throw error

  const invites: CoupleInvite[] = data.map((row) => ({
    id: row.id,
    inviteCode: row.invite_code,
    inviterId: row.inviter_id,
    inviteeEmail: row.invitee_email,
    createdAt: row.created_at,
  }))

  return {
    sent: invites.filter((invite) => invite.inviterId === user.id),
    received: invites.filter((invite) => invite.inviterId !== user.id),
  }
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
