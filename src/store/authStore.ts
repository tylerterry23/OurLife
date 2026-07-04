import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string
  ) => Promise<{ needsEmailConfirmation: boolean }>
  logout: () => Promise<void>
  initSession: () => Promise<void>
}

// Stands in for a real Supabase User while no project is connected — just
// enough shape to satisfy the type. Login accepts anything in demo mode.
function createDemoUser(email: string): User {
  return {
    id: 'demo-user',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    email,
    created_at: new Date().toISOString(),
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      login: async (email, password) => {
        if (!isSupabaseConfigured) {
          set({ user: createDemoUser(email || 'demo@ourlife.app') })
          return
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        set({ user: data.user })
      },
      signUp: async (email, password) => {
        if (!isSupabaseConfigured) {
          set({ user: createDemoUser(email || 'demo@ourlife.app') })
          return { needsEmailConfirmation: false }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        if (data.session) {
          set({ user: data.user })
          return { needsEmailConfirmation: false }
        }

        return { needsEmailConfirmation: true }
      },
      logout: async () => {
        if (!isSupabaseConfigured) {
          set({ user: null })
          return
        }

        await supabase.auth.signOut()
        set({ user: null })
      },
      initSession: async () => {
        if (!isSupabaseConfigured) {
          // Auto-sign-in so the app is browsable as a standalone demo —
          // logging out still drops back to a working (demo) login screen.
          set({ user: createDemoUser('demo@ourlife.app'), isLoading: false })
          return
        }

        const { data } = await supabase.auth.getSession()
        set({ user: data.session?.user ?? null, isLoading: false })
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user }) }
  )
)

if (isSupabaseConfigured) {
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ user: session?.user ?? null })
  })
}
