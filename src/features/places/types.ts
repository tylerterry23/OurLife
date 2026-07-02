export type PlaceStatus = 'visited' | 'planned'

export interface Place {
  id: string
  name: string
  status: PlaceStatus
  city: string | null
  notes: string | null
  createdAt: string
}
