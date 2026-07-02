export interface WishlistItem {
  id: string
  addedBy: string
  title: string
  url?: string | null
  notes: string | null
  claimed: boolean
  createdAt: string
}
