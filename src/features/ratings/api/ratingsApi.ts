import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { createDemoCollection } from '@/lib/demoStore'
import { getMyCoupleId, getPartnerUserId } from '@/lib/coupleContext'
import type { Database } from '@/types/supabase'
import type { Rating, RatingCategory, RatingStatus } from '../types'

type RatingRow = Database['public']['Tables']['ratings']['Row']
type RatingInsert = Database['public']['Tables']['ratings']['Insert']
type RatingUpdate = Database['public']['Tables']['ratings']['Update']
type ScoreRow = Database['public']['Tables']['rating_scores']['Row']

type RatingWithScores = RatingRow & { rating_scores: Pick<ScoreRow, 'user_id' | 'score'>[] }

function toRating(row: RatingWithScores, myUserId: string): Rating {
  const mine = row.rating_scores.find((s) => s.user_id === myUserId)
  const partner = row.rating_scores.find((s) => s.user_id !== myUserId)
  return {
    id: row.id,
    status: (row.status as RatingStatus) ?? 'rated',
    category: row.category as RatingCategory,
    title: row.title,
    myScore: mine?.score ?? null,
    partnerScore: partner?.score ?? null,
    note: row.note,
    createdAt: row.created_at,
  }
}

function toInsert(
  payload: Pick<Rating, 'status' | 'category' | 'title' | 'note'>
): Omit<RatingInsert, 'couple_id'> {
  return {
    status: payload.status,
    category: payload.category,
    title: payload.title,
    note: payload.note,
  }
}

function toUpdate(payload: Partial<Rating>): RatingUpdate {
  const update: RatingUpdate = {}
  if (payload.status !== undefined) update.status = payload.status
  if (payload.category !== undefined) update.category = payload.category
  if (payload.title !== undefined) update.title = payload.title
  if (payload.note !== undefined) update.note = payload.note
  return update
}

const demoRatings = createDemoCollection<Rating>('ratings', [
  {
    id: crypto.randomUUID(),
    status: 'rated',
    category: 'movie',
    title: 'Everything Everywhere All at Once',
    myScore: 9.5,
    partnerScore: 10,
    note: 'Still thinking about the rock scene.',
    createdAt: new Date('2025-03-14T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    status: 'rated',
    category: 'restaurant',
    title: 'Corner ramen spot',
    myScore: 8,
    partnerScore: 9,
    note: 'Go back for the spicy miso.',
    createdAt: new Date('2025-05-02T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    status: 'rated',
    category: 'city',
    title: 'Portland',
    myScore: 7.5,
    partnerScore: 5,
    note: null,
    createdAt: new Date('2025-06-20T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    status: 'want',
    category: 'movie',
    title: 'Past Lives',
    myScore: null,
    partnerScore: null,
    note: 'Everyone keeps recommending it.',
    createdAt: new Date('2025-06-28T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    status: 'want',
    category: 'restaurant',
    title: 'That new tapas place downtown',
    myScore: null,
    partnerScore: null,
    note: null,
    createdAt: new Date('2025-07-01T00:00:00Z').toISOString(),
  },
])

async function getMyUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Not signed in.')
  return data.user.id
}

export async function getRatings(): Promise<Rating[]> {
  if (!isSupabaseConfigured) return demoRatings.list()

  const myUserId = await getMyUserId()
  const { data, error } = await supabase
    .from('ratings')
    .select('*, rating_scores(user_id, score)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((row) => toRating(row, myUserId))
}

export async function getRating(id: string): Promise<Rating> {
  if (!isSupabaseConfigured) {
    const rating = demoRatings.get(id)
    if (!rating) throw new Error(`Rating "${id}" not found`)
    return rating
  }

  const myUserId = await getMyUserId()
  const { data, error } = await supabase
    .from('ratings')
    .select('*, rating_scores(user_id, score)')
    .eq('id', id)
    .single()
  if (error) throw error
  return toRating(data, myUserId)
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

  const [coupleId, myUserId] = await Promise.all([getMyCoupleId(), getMyUserId()])
  if (!coupleId) throw new Error('You need to be in a couple to add a rating.')
  const partnerUserId = await getPartnerUserId(myUserId)

  const { data: ratingRow, error } = await supabase
    .from('ratings')
    .insert({ ...toInsert(payload), couple_id: coupleId })
    .select()
    .single()
  if (error) throw error

  const scoreRows = [
    { rating_id: ratingRow.id, user_id: myUserId, score: payload.myScore },
    ...(partnerUserId
      ? [{ rating_id: ratingRow.id, user_id: partnerUserId, score: payload.partnerScore }]
      : []),
  ]
  const { data: scores, error: scoreError } = await supabase
    .from('rating_scores')
    .insert(scoreRows)
    .select('user_id, score')
  if (scoreError) throw scoreError

  return toRating({ ...ratingRow, rating_scores: scores }, myUserId)
}

export async function updateRating(
  id: string,
  payload: Partial<Rating>
): Promise<Rating> {
  if (!isSupabaseConfigured) return demoRatings.update(id, payload)

  const myUserId = await getMyUserId()

  const ratingUpdate = toUpdate(payload)
  if (Object.keys(ratingUpdate).length > 0) {
    const { error } = await supabase.from('ratings').update(ratingUpdate).eq('id', id)
    if (error) throw error
  }

  if (payload.myScore !== undefined) {
    const { error } = await supabase
      .from('rating_scores')
      .upsert(
        { rating_id: id, user_id: myUserId, score: payload.myScore },
        { onConflict: 'rating_id,user_id' }
      )
    if (error) throw error
  }

  if (payload.partnerScore !== undefined) {
    const partnerUserId = await getPartnerUserId(myUserId)
    if (partnerUserId) {
      const { error } = await supabase
        .from('rating_scores')
        .upsert(
          { rating_id: id, user_id: partnerUserId, score: payload.partnerScore },
          { onConflict: 'rating_id,user_id' }
        )
      if (error) throw error
    }
  }

  return getRating(id)
}

export async function deleteRating(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoRatings.remove(id)
    return
  }

  const { error } = await supabase.from('ratings').delete().eq('id', id)
  if (error) throw error
}
