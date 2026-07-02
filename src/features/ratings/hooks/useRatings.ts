import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRating,
  deleteRating,
  getRating,
  getRatings,
  updateRating,
} from '../api/ratingsApi'
import type { Rating } from '../types'

const ratingsKey = ['ratings'] as const

export function useRatings() {
  return useQuery({ queryKey: ratingsKey, queryFn: getRatings })
}

export function useRating(id: string) {
  return useQuery({
    queryKey: [...ratingsKey, id],
    queryFn: () => getRating(id),
    enabled: Boolean(id),
  })
}

export function useCreateRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Rating, 'id' | 'createdAt'>) =>
      createRating(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingsKey })
    },
  })
}

export function useUpdateRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Rating> }) =>
      updateRating(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingsKey })
    },
  })
}

export function useDeleteRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRating(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingsKey })
    },
  })
}
