import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getMyProfile, updateMyProfile, uploadAvatar } from '../api/profileApi'

const profileKey = ['my-profile'] as const

export function useMyProfile() {
  return useQuery({ queryKey: profileKey, queryFn: getMyProfile })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey }),
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey }),
  })
}
