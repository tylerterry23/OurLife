import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'

export type ProfileStatus =
  | 'dating'
  | 'engaged'
  | 'married'
  | 'situationship'
  | 'its_complicated'

export interface Profile {
  displayName: string | null
  username: string | null
  status: ProfileStatus
  avatarUrl: string | null
}

type ProfileRow = Database['public']['Tables']['profiles']['Row']

function toProfile(row: ProfileRow): Profile {
  return {
    displayName: row.display_name,
    username: row.username,
    status: row.status as ProfileStatus,
    avatarUrl: row.avatar_url,
  }
}

async function getMyUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Not signed in.')
  return data.user.id
}

export async function getMyProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null

  const userId = await getMyUserId()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? toProfile(data) : null
}

export async function updateMyProfile(
  patch: Partial<Pick<Profile, 'displayName' | 'username' | 'status'>>
): Promise<Profile> {
  const userId = await getMyUserId()

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        ...(patch.displayName !== undefined && { display_name: patch.displayName }),
        ...(patch.username !== undefined && { username: patch.username }),
        ...(patch.status !== undefined && { status: patch.status }),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
  if (error) throw error
  return toProfile(data)
}

export async function uploadAvatar(file: File): Promise<string> {
  const userId = await getMyUserId()
  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('profiles')
    .upsert(
      { user_id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (updateError) throw updateError

  return publicUrl
}

export async function deleteMyAccount(): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
}
