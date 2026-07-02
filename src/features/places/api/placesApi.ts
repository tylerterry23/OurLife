import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { createDemoCollection } from '@/lib/demoStore'
import type { Database } from '@/types/supabase'
import type { Place } from '../types'

type PlaceRow = Database['public']['Tables']['places']['Row']
type PlaceInsert = Database['public']['Tables']['places']['Insert']
type PlaceUpdate = Database['public']['Tables']['places']['Update']

function toPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    city: row.city,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

function toInsert(payload: Omit<Place, 'id' | 'createdAt'>): PlaceInsert {
  return {
    name: payload.name,
    status: payload.status,
    city: payload.city,
    notes: payload.notes,
  }
}

function toUpdate(payload: Partial<Place>): PlaceUpdate {
  const update: PlaceUpdate = {}
  if (payload.name !== undefined) update.name = payload.name
  if (payload.status !== undefined) update.status = payload.status
  if (payload.city !== undefined) update.city = payload.city
  if (payload.notes !== undefined) update.notes = payload.notes
  return update
}

const demoPlaces = createDemoCollection<Place>('places', [
  {
    id: crypto.randomUUID(),
    name: 'Kyoto',
    status: 'visited',
    city: 'Kyoto, Japan',
    notes: 'Cherry blossoms were just starting to bloom.',
    createdAt: new Date('2025-04-05T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Iceland ring road',
    status: 'planned',
    city: 'Iceland',
    notes: 'Aim for the northern lights season.',
    createdAt: new Date('2025-06-01T00:00:00Z').toISOString(),
  },
])

export async function getPlaces(): Promise<Place[]> {
  if (!isSupabaseConfigured) return demoPlaces.list()

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toPlace)
}

export async function getPlace(id: string): Promise<Place> {
  if (!isSupabaseConfigured) {
    const place = demoPlaces.get(id)
    if (!place) throw new Error(`Place "${id}" not found`)
    return place
  }

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return toPlace(data)
}

export async function createPlace(
  payload: Omit<Place, 'id' | 'createdAt'>
): Promise<Place> {
  if (!isSupabaseConfigured) {
    return demoPlaces.insert({
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  }

  const { data, error } = await supabase
    .from('places')
    .insert(toInsert(payload))
    .select()
    .single()
  if (error) throw error
  return toPlace(data)
}

export async function updatePlace(
  id: string,
  payload: Partial<Place>
): Promise<Place> {
  if (!isSupabaseConfigured) return demoPlaces.update(id, payload)

  const { data, error } = await supabase
    .from('places')
    .update(toUpdate(payload))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toPlace(data)
}

export async function deletePlace(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoPlaces.remove(id)
    return
  }

  const { error } = await supabase.from('places').delete().eq('id', id)
  if (error) throw error
}
