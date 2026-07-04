import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  acceptInvite,
  declineInvite,
  getMyCoupleStatus,
  getMyInvites,
  invitePartner,
  leavePartner,
  setCoupleRelationshipStatus,
} from '../api/coupleApi'
import type { RelationshipStatus } from '../types'

const coupleStatusKey = ['couple-status'] as const
const coupleInvitesKey = ['couple-invites'] as const

export function useCoupleStatus() {
  return useQuery({ queryKey: coupleStatusKey, queryFn: getMyCoupleStatus })
}

export function useMyInvites() {
  return useQuery({ queryKey: coupleInvitesKey, queryFn: getMyInvites })
}

// Membership changes ripple into who your partner is and both members'
// profiles, so invalidate those caches too.
function useInvalidateCouple() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: coupleStatusKey })
    queryClient.invalidateQueries({ queryKey: coupleInvitesKey })
    queryClient.invalidateQueries({ queryKey: ['couple-profiles'] })
  }
}

export function useInvitePartner() {
  const invalidate = useInvalidateCouple()
  return useMutation({
    mutationFn: (email: string) => invitePartner(email),
    onSuccess: invalidate,
  })
}

export function useAcceptInvite() {
  const invalidate = useInvalidateCouple()
  return useMutation({
    mutationFn: (inviteCode: string) => acceptInvite(inviteCode),
    onSuccess: invalidate,
  })
}

export function useDeclineInvite() {
  const invalidate = useInvalidateCouple()
  return useMutation({
    mutationFn: (inviteCode: string) => declineInvite(inviteCode),
    onSuccess: invalidate,
  })
}

export function useLeaveCouple() {
  const invalidate = useInvalidateCouple()
  return useMutation({
    mutationFn: () => leavePartner(),
    onSuccess: invalidate,
  })
}

export function useSetRelationshipStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      coupleId,
      status,
    }: {
      coupleId: string
      status: RelationshipStatus
    }) => setCoupleRelationshipStatus(coupleId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: coupleStatusKey }),
  })
}
