import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPlace,
  deletePlace,
  getPlace,
  getPlaces,
  updatePlace,
} from '../api/placesApi'
import type { Place } from '../types'

const placesKey = ['places'] as const

export function usePlaces() {
  return useQuery({ queryKey: placesKey, queryFn: getPlaces })
}

export function usePlace(id: string) {
  return useQuery({
    queryKey: [...placesKey, id],
    queryFn: () => getPlace(id),
    enabled: Boolean(id),
  })
}

export function useCreatePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Place, 'id' | 'createdAt'>) =>
      createPlace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placesKey })
    },
  })
}

export function useUpdatePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Place> }) =>
      updatePlace(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placesKey })
    },
  })
}

export function useDeletePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placesKey })
    },
  })
}
