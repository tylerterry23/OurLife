import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { createDemoCollection } from '@/lib/demoStore'
import { getMyCoupleId } from '@/lib/coupleContext'
import type { Database } from '@/types/supabase'
import type { Prompt, PromptCategory } from '../types'

type PromptRow = Database['public']['Tables']['game_prompts']['Row']

function toPrompt(row: PromptRow): Prompt {
  return {
    id: row.id,
    category: row.category as PromptCategory,
    text: row.text,
    custom: true,
  }
}

const demoCustomPrompts = createDemoCollection<Prompt>('game_prompts', [])

export async function getCustomPrompts(): Promise<Prompt[]> {
  if (!isSupabaseConfigured) return demoCustomPrompts.list()

  const { data, error } = await supabase.from('game_prompts').select('*')
  if (error) throw error
  return data.map(toPrompt)
}

export async function addCustomPrompt(
  category: PromptCategory,
  text: string
): Promise<Prompt> {
  if (!isSupabaseConfigured) {
    return demoCustomPrompts.insert({
      id: crypto.randomUUID(),
      category,
      text,
      custom: true,
    })
  }

  const coupleId = await getMyCoupleId()
  if (!coupleId) throw new Error('You need to be in a couple to add a prompt.')

  const { data, error } = await supabase
    .from('game_prompts')
    .insert({ couple_id: coupleId, category, text })
    .select()
    .single()
  if (error) throw error
  return toPrompt(data)
}

export async function deleteCustomPrompt(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoCustomPrompts.remove(id)
    return
  }

  const { error } = await supabase.from('game_prompts').delete().eq('id', id)
  if (error) throw error
}
