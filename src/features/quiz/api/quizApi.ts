import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'
import type { QuizQuestion } from '../types'

type QuizRow = Database['public']['Tables']['quiz_questions']['Row']
type QuizInsert = Database['public']['Tables']['quiz_questions']['Insert']
type QuizUpdate = Database['public']['Tables']['quiz_questions']['Update']

function toQuizQuestion(row: QuizRow): QuizQuestion {
  return {
    id: row.id,
    askedBy: row.asked_by,
    question: row.question,
    answer: row.answer,
    answeredAt: row.answered_at,
    createdAt: row.created_at,
  }
}

function toInsert(payload: Omit<QuizQuestion, 'id' | 'createdAt'>): QuizInsert {
  return {
    asked_by: payload.askedBy,
    question: payload.question,
    answer: payload.answer,
    answered_at: payload.answeredAt,
  }
}

function toUpdate(payload: Partial<QuizQuestion>): QuizUpdate {
  const update: QuizUpdate = {}
  if (payload.askedBy !== undefined) update.asked_by = payload.askedBy
  if (payload.question !== undefined) update.question = payload.question
  if (payload.answer !== undefined) update.answer = payload.answer
  if (payload.answeredAt !== undefined) update.answered_at = payload.answeredAt
  return update
}

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toQuizQuestion)
}

export async function getQuizQuestion(id: string): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return toQuizQuestion(data)
}

export async function createQuizQuestion(
  payload: Omit<QuizQuestion, 'id' | 'createdAt'>
): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert(toInsert(payload))
    .select()
    .single()
  if (error) throw error
  return toQuizQuestion(data)
}

export async function updateQuizQuestion(
  id: string,
  payload: Partial<QuizQuestion>
): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .update(toUpdate(payload))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toQuizQuestion(data)
}

export async function deleteQuizQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id)
  if (error) throw error
}
