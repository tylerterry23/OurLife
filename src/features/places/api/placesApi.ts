import { supabase } from '@/lib/supabaseClient'
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

export async function getPlaces(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toPlace)
}

export async function getPlace(id: string): Promise<Place> {
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
  const { error } = await supabase.from('places').delete().eq('id', id)
  if (error) throw error
}
