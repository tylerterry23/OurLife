// Hand-written stub. Once the Supabase project exists, replace this file by
// running: npx supabase gen types typescript --project-id <id> > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ratings: {
        Row: {
          id: string
          category: 'movie' | 'show' | 'restaurant' | 'city'
          title: string
          tyler_score: number | null
          lauren_score: number | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category: 'movie' | 'show' | 'restaurant' | 'city'
          title: string
          tyler_score?: number | null
          lauren_score?: number | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: 'movie' | 'show' | 'restaurant' | 'city'
          title?: string
          tyler_score?: number | null
          lauren_score?: number | null
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          id: string
          name: string
          status: 'visited' | 'planned'
          city: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          status: 'visited' | 'planned'
          city?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'visited' | 'planned'
          city?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      important_dates: {
        Row: {
          id: string
          label: string
          date: string
          recurring: boolean
        }
        Insert: {
          id?: string
          label: string
          date: string
          recurring?: boolean
        }
        Update: {
          id?: string
          label?: string
          date?: string
          recurring?: boolean
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          id: string
          asked_by: string
          question: string
          answer: string | null
          answered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          asked_by: string
          question: string
          answer?: string | null
          answered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          asked_by?: string
          question?: string
          answer?: string | null
          answered_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          id: string
          added_by: string
          title: string
          url: string | null
          notes: string | null
          claimed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          added_by: string
          title: string
          url?: string | null
          notes?: string | null
          claimed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          added_by?: string
          title?: string
          url?: string | null
          notes?: string | null
          claimed?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
