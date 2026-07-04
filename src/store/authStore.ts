import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (params: {
    email: string
    password: string
    displayName: string
    username: string
  }) => Promise<{ needsEmailConfirmation: boolean }>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
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
      signUp: async ({ email, password, displayName, username }) => {
        if (!isSupabaseConfigured) {
          set({ user: createDemoUser(email || 'demo@ourlife.app') })
          return { needsEmailConfirmation: false }
        }

        // display_name / username go into user metadata so the
        // handle_new_user DB trigger can build the profile row at signup
        // time — this is what makes them survive email confirmation.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              username: username || null,
            },
          },
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
      requestPasswordReset: async (email) => {
        if (!isSupabaseConfigured) return
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
      },
      updatePassword: async (password) => {
        if (!isSupabaseConfigured) return
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
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
