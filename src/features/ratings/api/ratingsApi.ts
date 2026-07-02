import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'
import type { Rating } from '../types'

type RatingRow = Database['public']['Tables']['ratings']['Row']
type RatingInsert = Database['public']['Tables']['ratings']['Insert']
type RatingUpdate = Database['public']['Tables']['ratings']['Update']

function toRating(row: RatingRow): Rating {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    tylerScore: row.tyler_score,
    laurenScore: row.lauren_score,
    note: row.note,
    createdAt: row.created_at,
  }
}

function toInsert(payload: Omit<Rating, 'id' | 'createdAt'>): RatingInsert {
  return {
    category: payload.category,
    title: payload.title,
    tyler_score: payload.tylerScore,
    lauren_score: payload.laurenScore,
    note: payload.note,
  }
}

function toUpdate(payload: Partial<Rating>): RatingUpdate {
  const update: RatingUpdate = {}
  if (payload.category !== undefined) update.category = payload.category
  if (payload.title !== undefined) update.title = payload.title
  if (payload.tylerScore !== undefined) update.tyler_score = payload.tylerScore
  if (payload.laurenScore !== undefined)
    update.lauren_score = payload.laurenScore
  if (payload.note !== undefined) update.note = payload.note
  return update
}

export async function getRatings(): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toRating)
}

export async function getRating(id: string): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return toRating(data)
}

export async function createRating(
  payload: Omit<Rating, 'id' | 'createdAt'>
): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .insert(toInsert(payload))
    .select()
    .single()
  if (error) throw error
  return toRating(data)
}

export async function updateRating(
  id: string,
  payload: Partial<Rating>
): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .update(toUpdate(payload))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toRating(data)
}

export async function deleteRating(id: string): Promise<void> {
  const { error } = await supabase.from('ratings').delete().eq('id', id)
  if (error) throw error
}
