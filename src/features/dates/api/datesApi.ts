import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'
import type { ImportantDate } from '../types'

type DateRow = Database['public']['Tables']['important_dates']['Row']
type DateInsert = Database['public']['Tables']['important_dates']['Insert']
type DateUpdate = Database['public']['Tables']['important_dates']['Update']

function toImportantDate(row: DateRow): ImportantDate {
  return {
    id: row.id,
    label: row.label,
    date: row.date,
    recurring: row.recurring,
  }
}

function toInsert(payload: Omit<ImportantDate, 'id'>): DateInsert {
  return {
    label: payload.label,
    date: payload.date,
    recurring: payload.recurring,
  }
}

function toUpdate(payload: Partial<ImportantDate>): DateUpdate {
  const update: DateUpdate = {}
  if (payload.label !== undefined) update.label = payload.label
  if (payload.date !== undefined) update.date = payload.date
  if (payload.recurring !== undefined) update.recurring = payload.recurring
  return update
}

export async function getDates(): Promise<ImportantDate[]> {
  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data.map(toImportantDate)
}

export async function getDate(id: string): Promise<ImportantDate> {
  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return toImportantDate(data)
}

export async function createDate(
  payload: Omit<ImportantDate, 'id'>
): Promise<ImportantDate> {
  const { data, error } = await supabase
    .from('important_dates')
    .insert(toInsert(payload))
    .select()
    .single()
  if (error) throw error
  return toImportantDate(data)
}

export async function updateDate(
  id: string,
  payload: Partial<ImportantDate>
): Promise<ImportantDate> {
  const { data, error } = await supabase
    .from('important_dates')
    .update(toUpdate(payload))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toImportantDate(data)
}

export async function deleteDate(id: string): Promise<void> {
  const { error } = await supabase.from('important_dates').delete().eq('id', id)
  if (error) throw error
}
