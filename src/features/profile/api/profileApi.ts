import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import {
  DEMO_ME_USER_ID,
  DEMO_PARTNER_NAME,
  DEMO_PARTNER_USER_ID,
  readDemoIdentity,
  writeDemoIdentity,
} from '@/lib/demoIdentity'
import type { Database } from '@/types/supabase'

export interface Profile {
  userId: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  createdAt: string
}

// Best available human label for a profile: display name, then username,
// then a caller-supplied fallback ("You" / "Partner").
export function profileLabel(
  profile: Profile | null | undefined,
  fallback: string
): string {
  return profile?.displayName || profile?.username || fallback
}

function demoMeProfile(): Profile {
  const id = readDemoIdentity()
  return {
    userId: DEMO_ME_USER_ID,
    displayName: id.displayName,
    username: id.username,
    avatarUrl: id.avatarUrl,
    createdAt: id.createdAt,
  }
}

function demoPartnerProfile(): Profile {
  return {
    userId: DEMO_PARTNER_USER_ID,
    displayName: DEMO_PARTNER_NAME,
    username: DEMO_PARTNER_NAME.toLowerCase(),
    avatarUrl: null,
    createdAt: new Date('2025-02-01T00:00:00Z').toISOString(),
  }
}

// Both members of the caller's couple. `partner` is null until someone
// connects. Relationship status is NOT here — it's a couple property now.
export interface CoupleProfiles {
  me: Profile | null
  partner: Profile | null
}

type ProfileRow = Database['public']['Tables']['profiles']['Row']

function toProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    username: row.username,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  }
}

async function getMyUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Not signed in.')
  return data.user.id
}

export async function getMyProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return demoMeProfile()

  const userId = await getMyUserId()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? toProfile(data) : null
}

// The profiles RLS policy returns exactly the caller's own row plus their
// couple members' rows, so a single unfiltered select yields me + partner.
export async function getCoupleProfiles(): Promise<CoupleProfiles> {
  if (!isSupabaseConfigured) {
    return { me: demoMeProfile(), partner: demoPartnerProfile() }
  }

  const userId = await getMyUserId()
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) throw error

  const me = data.find((row) => row.user_id === userId)
  const partner = data.find((row) => row.user_id !== userId)
  return {
    me: me ? toProfile(me) : null,
    partner: partner ? toProfile(partner) : null,
  }
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true
  const { data, error } = await supabase.rpc('is_username_available', {
    p_username: username,
  })
  if (error) throw error
  return data
}

export async function updateMyProfile(
  patch: Partial<Pick<Profile, 'displayName' | 'username'>>
): Promise<Profile> {
  if (!isSupabaseConfigured) {
    writeDemoIdentity({
      ...(patch.displayName != null && { displayName: patch.displayName }),
      ...(patch.username != null && { username: patch.username }),
    })
    return demoMeProfile()
  }

  const userId = await getMyUserId()

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        ...(patch.displayName !== undefined && {
          display_name: patch.displayName,
        }),
        ...(patch.username !== undefined && { username: patch.username }),
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
  if (!isSupabaseConfigured) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    writeDemoIdentity({ avatarUrl: dataUrl })
    return dataUrl
  }

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
      {
        user_id: userId,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  if (updateError) throw updateError

  return publicUrl
}

export async function removeAvatar(): Promise<void> {
  if (!isSupabaseConfigured) {
    writeDemoIdentity({ avatarUrl: null })
    return
  }

  const userId = await getMyUserId()
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) throw error
}

export async function deleteMyAccount(): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
}
