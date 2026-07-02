import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { createDemoCollection } from '@/lib/demoStore'
import type { Database } from '@/types/supabase'
import type { WishlistItem } from '../types'

type WishlistRow = Database['public']['Tables']['wishlist_items']['Row']
type WishlistInsert = Database['public']['Tables']['wishlist_items']['Insert']
type WishlistUpdate = Database['public']['Tables']['wishlist_items']['Update']

function toWishlistItem(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    addedBy: row.added_by,
    title: row.title,
    url: row.url,
    notes: row.notes,
    claimed: row.claimed,
    createdAt: row.created_at,
  }
}

function toInsert(
  payload: Omit<WishlistItem, 'id' | 'createdAt'>
): WishlistInsert {
  return {
    added_by: payload.addedBy,
    title: payload.title,
    url: payload.url,
    notes: payload.notes,
    claimed: payload.claimed,
  }
}

function toUpdate(payload: Partial<WishlistItem>): WishlistUpdate {
  const update: WishlistUpdate = {}
  if (payload.addedBy !== undefined) update.added_by = payload.addedBy
  if (payload.title !== undefined) update.title = payload.title
  if (payload.url !== undefined) update.url = payload.url
  if (payload.notes !== undefined) update.notes = payload.notes
  if (payload.claimed !== undefined) update.claimed = payload.claimed
  return update
}

const demoWishlist = createDemoCollection<WishlistItem>('wishlist_items', [
  {
    id: crypto.randomUUID(),
    addedBy: 'Lauren',
    title: 'Weighted blanket',
    url: null,
    notes: 'Queen size, something neutral.',
    claimed: false,
    createdAt: new Date('2025-05-20T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    addedBy: 'Tyler',
    title: 'Film camera',
    url: null,
    notes: 'Something simple, point and shoot.',
    claimed: true,
    createdAt: new Date('2025-06-01T00:00:00Z').toISOString(),
  },
])

export async function getWishlistItems(): Promise<WishlistItem[]> {
  if (!isSupabaseConfigured) return demoWishlist.list()

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toWishlistItem)
}

export async function getWishlistItem(id: string): Promise<WishlistItem> {
  if (!isSupabaseConfigured) {
    const item = demoWishlist.get(id)
    if (!item) throw new Error(`Wishlist item "${id}" not found`)
    return item
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return toWishlistItem(data)
}

export async function createWishlistItem(
  payload: Omit<WishlistItem, 'id' | 'createdAt'>
): Promise<WishlistItem> {
  if (!isSupabaseConfigured) {
    return demoWishlist.insert({
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert(toInsert(payload))
    .select()
    .single()
  if (error) throw error
  return toWishlistItem(data)
}

export async function updateWishlistItem(
  id: string,
  payload: Partial<WishlistItem>
): Promise<WishlistItem> {
  if (!isSupabaseConfigured) return demoWishlist.update(id, payload)

  const { data, error } = await supabase
    .from('wishlist_items')
    .update(toUpdate(payload))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toWishlistItem(data)
}

export async function deleteWishlistItem(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoWishlist.remove(id)
    return
  }

  const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
  if (error) throw error
}
