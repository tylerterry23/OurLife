import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  acceptCoupleRequest,
  acceptInvite,
  cancelCoupleRequest,
  declineCoupleRequest,
  declineInvite,
  findUserByUsername,
  getIncomingRequests,
  getMyCoupleStatus,
  getOutgoingRequests,
  invitePartner,
  leavePartner,
  sendCoupleRequest,
  setCoupleRelationshipStatus,
} from '../api/coupleApi'
import type { RelationshipStatus } from '../types'

const coupleStatusKey = ['couple-status'] as const
const incomingRequestsKey = ['couple-requests', 'incoming'] as const
const outgoingRequestsKey = ['couple-requests', 'outgoing'] as const

export function useCoupleStatus() {
  return useQuery({ queryKey: coupleStatusKey, queryFn: getMyCoupleStatus })
}

export function useIncomingRequests() {
  return useQuery({ queryKey: incomingRequestsKey, queryFn: getIncomingRequests })
}

export function useOutgoingRequests() {
  return useQuery({ queryKey: outgoingRequestsKey, queryFn: getOutgoingRequests })
}

// Membership changes ripple into who your partner is and both members'
// profiles, so invalidate those caches too.
function useInvalidateCouple() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: coupleStatusKey })
    queryClient.invalidateQueries({ queryKey: ['couple-requests'] })
    queryClient.invalidateQueries({ queryKey: ['couple-profiles'] })
  }
}

export function useFindUserByUsername() {
  return useMutation({
    mutationFn: (username: string) => findUserByUsername(username),
  })
}

export function useSendCoupleRequest() {
  const invalidate = useInvalidateCouple()
  return useMutation({
    mutationFn: (username: string) => sendCoupleRequest(username),
    onSuccess: invalidate,
  })
}

export function useAcceptCoupleRequest() {
  const invalidate = useInvalidateCouple()
  return useMutation({
    mutationFn: (inviteId: string) => acceptCoupleRequest(inviteId),
    onSuccess: invalidate,
  })
}

export function useDeclineCoupleRequest() {
  const invalidate = useInvalidateCouple()
  return useMutation({
    mutationFn: (inviteId: string) => declineCoupleRequest(inviteId),
    onSuccess: invalidate,
  })
}

export function useCancelCoupleRequest() {
  const invalidate = useInvalidateCouple()
  return useMutation({
    mutationFn: (inviteId: string) => cancelCoupleRequest(inviteId),
    onSuccess: invalidate,
  })
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
