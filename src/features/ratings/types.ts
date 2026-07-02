export type RatingCategory = 'movie' | 'show' | 'restaurant' | 'city'

export interface Rating {
  id: string
  category: RatingCategory
  title: string
  tylerScore: number | null
  laurenScore: number | null
  note: string | null
  createdAt: string
}
