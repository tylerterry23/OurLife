import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { createDemoCollection } from '@/lib/demoStore'
import { getMyCoupleId } from '@/lib/coupleContext'
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
    createdAt: row.created_at,
  }
}

function toInsert(
  payload: Omit<ImportantDate, 'id' | 'createdAt'>
): Omit<DateInsert, 'couple_id'> {
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

const demoDates = createDemoCollection<ImportantDate>('important_dates', [
  {
    id: crypto.randomUUID(),
    label: 'Anniversary',
    date: '2025-09-12',
    recurring: true,
    createdAt: new Date('2025-03-14T00:00:00Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    label: "Alex's birthday",
    date: '2025-11-03',
    recurring: true,
    createdAt: new Date('2025-04-02T00:00:00Z').toISOString(),
  },
])

export async function getDates(): Promise<ImportantDate[]> {
  if (!isSupabaseConfigured) return demoDates.list()

  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data.map(toImportantDate)
}

export async function getDate(id: string): Promise<ImportantDate> {
  if (!isSupabaseConfigured) {
    const date = demoDates.get(id)
    if (!date) throw new Error(`Date "${id}" not found`)
    return date
  }

  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return toImportantDate(data)
}

export async function createDate(
  payload: Omit<ImportantDate, 'id' | 'createdAt'>
): Promise<ImportantDate> {
  if (!isSupabaseConfigured) {
    return demoDates.insert({
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  }

  const coupleId = await getMyCoupleId()
  if (!coupleId) throw new Error('You need to be in a couple to add a date.')

  const { data, error } = await supabase
    .from('important_dates')
    .insert({ ...toInsert(payload), couple_id: coupleId })
    .select()
    .single()
  if (error) throw error
  return toImportantDate(data)
}

export async function updateDate(
  id: string,
  payload: Partial<ImportantDate>
): Promise<ImportantDate> {
  if (!isSupabaseConfigured) return demoDates.update(id, payload)

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
  if (!isSupabaseConfigured) {
    demoDates.remove(id)
    return
  }

  const { error } = await supabase.from('important_dates').delete().eq('id', id)
  if (error) throw error
}
