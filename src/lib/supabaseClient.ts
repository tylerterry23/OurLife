import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// True once a real Supabase project is wired up via .env.development. Until
// then every feature api/ module and the auth store fall back to local demo
// data (see src/lib/demoStore.ts) so the app is fully browsable standalone.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[OurLife] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — ' +
      'running in demo mode with local placeholder data. Copy .env.example ' +
      'to .env.development and fill in real values to connect Supabase.'
  )
}

// In demo mode this client is constructed but never called — placeholder
// values just keep createClient() from throwing on an empty URL.
export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl : 'https://demo.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'demo-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
