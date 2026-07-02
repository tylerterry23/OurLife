import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createQuizQuestion,
  deleteQuizQuestion,
  getQuizQuestion,
  getQuizQuestions,
  updateQuizQuestion,
} from '../api/quizApi'
import type { QuizQuestion } from '../types'

const quizKey = ['quiz-questions'] as const

export function useQuizQuestions() {
  return useQuery({ queryKey: quizKey, queryFn: getQuizQuestions })
}

export function useQuizQuestion(id: string) {
  return useQuery({
    queryKey: [...quizKey, id],
    queryFn: () => getQuizQuestion(id),
    enabled: Boolean(id),
  })
}

export function useCreateQuizQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<QuizQuestion, 'id' | 'createdAt'>) =>
      createQuizQuestion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKey })
    },
  })
}

export function useUpdateQuizQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<QuizQuestion>
    }) => updateQuizQuestion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKey })
    },
  })
}

export function useDeleteQuizQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteQuizQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKey })
    },
  })
}
