import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { createDemoCollection } from '@/lib/demoStore'
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

const demoRatings = createDemoCollection<Rating>('ratings', [
  {
    id: crypto.randomUUID(),
    category: 'movie',
    title: 'Everything Everywhere All at Once',
    tylerScore: 9.5,
    laurenScore: 10,
    note: 'Still thinking about the rock scene.',
    createdAt: new Date('2025-03-14T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    category: 'restaurant',
    title: 'Corner ramen spot',
    tylerScore: 8,
    laurenScore: 9,
    note: 'Go back for the spicy miso.',
    createdAt: new Date('2025-05-02T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    category: 'city',
    title: 'Portland',
    tylerScore: 7.5,
    laurenScore: 8.5,
    note: null,
    createdAt: new Date('2025-06-20T00:00:00Z').toISOString(),
  },
])

export async function getRatings(): Promise<Rating[]> {
  if (!isSupabaseConfigured) return demoRatings.list()

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toRating)
}

export async function getRating(id: string): Promise<Rating> {
  if (!isSupabaseConfigured) {
    const rating = demoRatings.get(id)
    if (!rating) throw new Error(`Rating "${id}" not found`)
    return rating
  }

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
  if (!isSupabaseConfigured) {
    return demoRatings.insert({
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  }

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
  if (!isSupabaseConfigured) return demoRatings.update(id, payload)

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
  if (!isSupabaseConfigured) {
    demoRatings.remove(id)
    return
  }

  const { error } = await supabase.from('ratings').delete().eq('id', id)
  if (error) throw error
}
