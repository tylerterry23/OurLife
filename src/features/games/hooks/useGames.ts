import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addCustomPrompt,
  deleteCustomPrompt,
  getCustomPrompts,
} from '../api/gamesApi'
import type { PromptCategory } from '../types'

const customPromptsKey = ['custom-prompts'] as const

export function useCustomPrompts() {
  return useQuery({ queryKey: customPromptsKey, queryFn: getCustomPrompts })
}

export function useAddCustomPrompt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      category,
      text,
    }: {
      category: PromptCategory
      text: string
    }) => addCustomPrompt(category, text),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customPromptsKey }),
  })
}

export function useDeleteCustomPrompt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomPrompt(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customPromptsKey }),
  })
}
