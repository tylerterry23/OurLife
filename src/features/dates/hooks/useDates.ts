import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createDate,
  deleteDate,
  getDate,
  getDates,
  updateDate,
} from '../api/datesApi'
import type { ImportantDate } from '../types'

const datesKey = ['important-dates'] as const

export function useDates() {
  return useQuery({ queryKey: datesKey, queryFn: getDates })
}

export function useDate(id: string) {
  return useQuery({
    queryKey: [...datesKey, id],
    queryFn: () => getDate(id),
    enabled: Boolean(id),
  })
}

export function useCreateDate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<ImportantDate, 'id' | 'createdAt'>) =>
      createDate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datesKey })
    },
  })
}

export function useUpdateDate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<ImportantDate>
    }) => updateDate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datesKey })
    },
  })
}

export function useDeleteDate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datesKey })
    },
  })
}
