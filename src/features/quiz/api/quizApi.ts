import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { createDemoCollection } from '@/lib/demoStore'
import { getMyCoupleId } from '@/lib/coupleContext'
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

function toInsert(payload: Omit<QuizQuestion, 'id' | 'createdAt'>): Omit<QuizInsert, 'couple_id'> {
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

const demoQuestions = createDemoCollection<QuizQuestion>('quiz_questions', [
  {
    id: crypto.randomUUID(),
    askedBy: 'You',
    question: "What's a small thing I do that makes your day better?",
    answer: "Making coffee before I'm even out of bed.",
    answeredAt: new Date('2025-05-10T00:00:00Z').toISOString(),
    createdAt: new Date('2025-05-09T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    askedBy: 'Alex',
    question: 'What trip are you most excited to plan next?',
    answer: null,
    answeredAt: null,
    createdAt: new Date('2025-06-15T00:00:00Z').toISOString(),
  },
])

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  if (!isSupabaseConfigured) return demoQuestions.list()

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toQuizQuestion)
}

export async function getQuizQuestion(id: string): Promise<QuizQuestion> {
  if (!isSupabaseConfigured) {
    const question = demoQuestions.get(id)
    if (!question) throw new Error(`Question "${id}" not found`)
    return question
  }

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
  if (!isSupabaseConfigured) {
    return demoQuestions.insert({
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  }

  const coupleId = await getMyCoupleId()
  if (!coupleId) throw new Error('You need to be in a couple to add a question.')

  const { data, error } = await supabase
    .from('quiz_questions')
    .insert({ ...toInsert(payload), couple_id: coupleId })
    .select()
    .single()
  if (error) throw error
  return toQuizQuestion(data)
}

export async function updateQuizQuestion(
  id: string,
  payload: Partial<QuizQuestion>
): Promise<QuizQuestion> {
  if (!isSupabaseConfigured) return demoQuestions.update(id, payload)

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
  if (!isSupabaseConfigured) {
    demoQuestions.remove(id)
    return
  }

  const { error } = await supabase.from('quiz_questions').delete().eq('id', id)
  if (error) throw error
}
