import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteMyAccount,
  getCoupleProfiles,
  getMyProfile,
  removeAvatar,
  updateMyProfile,
  uploadAvatar,
} from '../api/profileApi'

const profileKey = ['my-profile'] as const
const coupleProfilesKey = ['couple-profiles'] as const

export function useMyProfile() {
  return useQuery({ queryKey: profileKey, queryFn: getMyProfile })
}

// Both members' real profiles (me + partner), for labelling shared content
// with actual names/avatars instead of hardcoded placeholders.
export function useCoupleProfiles() {
  return useQuery({ queryKey: coupleProfilesKey, queryFn: getCoupleProfiles })
}

function useInvalidateProfiles() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: profileKey })
    queryClient.invalidateQueries({ queryKey: coupleProfilesKey })
  }
}

export function useUpdateProfile() {
  const invalidate = useInvalidateProfiles()
  return useMutation({ mutationFn: updateMyProfile, onSuccess: invalidate })
}

export function useUploadAvatar() {
  const invalidate = useInvalidateProfiles()
  return useMutation({ mutationFn: uploadAvatar, onSuccess: invalidate })
}

export function useRemoveAvatar() {
  const invalidate = useInvalidateProfiles()
  return useMutation({ mutationFn: removeAvatar, onSuccess: invalidate })
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: deleteMyAccount })
}
