import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  acceptInvite,
  declineInvite,
  getMyCoupleStatus,
  getMyInvites,
  invitePartner,
  leavePartner,
} from '../api/coupleApi'

const coupleStatusKey = ['couple-status'] as const
const coupleInvitesKey = ['couple-invites'] as const

export function useCoupleStatus() {
  return useQuery({ queryKey: coupleStatusKey, queryFn: getMyCoupleStatus })
}

export function useMyInvites() {
  return useQuery({ queryKey: coupleInvitesKey, queryFn: getMyInvites })
}

function useInvalidateCouple() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: coupleStatusKey })
    queryClient.invalidateQueries({ queryKey: coupleInvitesKey })
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
