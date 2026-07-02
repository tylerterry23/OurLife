import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        set({ user: data.user })
      },
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },
      initSession: async () => {
        const { data } = await supabase.auth.getSession()
        set({ user: data.session?.user ?? null, isLoading: false })
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user }) }
  )
)

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ user: session?.user ?? null })
})
