export type RatingCategory = 'movie' | 'show' | 'restaurant' | 'city' | 'book'

export type RatingStatus = 'want' | 'rated'

export interface Rating {
  id: string
  status: RatingStatus
  category: RatingCategory
  title: string
  myScore: number | null
  partnerScore: number | null
  note: string | null
  createdAt: string
}

export const categoryLabels: Record<RatingCategory, string> = {
  movie: 'Movie',
  show: 'Show',
  restaurant: 'Restaurant',
  city: 'City',
  book: 'Book',
}

export const categoryOrder: RatingCategory[] = [
  'movie',
  'show',
  'restaurant',
  'city',
  'book',
]

// The verb that fits each category for a not-yet-rated ("want") item.
export const wantVerb: Record<RatingCategory, string> = {
  movie: 'to watch',
  show: 'to watch',
  restaurant: 'to try',
  city: 'to visit',
  book: 'to read',
}

// Combined score = the couple's average, when both have scored.
export function combinedScore(rating: Rating): number | null {
  const scores = [rating.myScore, rating.partnerScore].filter(
    (s): s is number => s != null
  )
  if (scores.length === 0) return null
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

// How aligned the two scores are, for an at-a-glance agreement cue.
export function agreement(
  rating: Rating
): 'aligned' | 'close' | 'split' | null {
  if (rating.myScore == null || rating.partnerScore == null) return null
  const gap = Math.abs(rating.myScore - rating.partnerScore)
  if (gap <= 0.5) return 'aligned'
  if (gap <= 2) return 'close'
  return 'split'
}
