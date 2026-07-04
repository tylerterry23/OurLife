export type RatingCategory = 'movie' | 'show' | 'restaurant' | 'city'

export interface Rating {
  id: string
  category: RatingCategory
  title: string
  myScore: number | null
  partnerScore: number | null
  note: string | null
  createdAt: string
}
