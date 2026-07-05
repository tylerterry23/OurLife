export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      couple_invites: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          invite_code: string
          invitee_email: string | null
          invitee_user_id: string | null
          inviter_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          invite_code?: string
          invitee_email?: string | null
          invitee_user_id?: string | null
          inviter_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          invite_code?: string
          invitee_email?: string | null
          invitee_user_id?: string | null
          inviter_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_invites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_members: {
        Row: {
          couple_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          couple_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          couple_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_members_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      game_prompts: {
        Row: {
          category: string
          couple_id: string
          created_at: string
          id: string
          text: string
        }
        Insert: {
          category: string
          couple_id: string
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          category?: string
          couple_id?: string
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_prompts_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      important_dates: {
        Row: {
          couple_id: string
          created_at: string
          date: string
          id: string
          label: string
          recurring: boolean
        }
        Insert: {
          couple_id: string
          created_at?: string
          date: string
          id?: string
          label: string
          recurring?: boolean
        }
        Update: {
          couple_id?: string
          created_at?: string
          date?: string
          id?: string
          label?: string
          recurring?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "important_dates_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          asked_by: string
          couple_id: string
          created_at: string
          id: string
          question: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          asked_by: string
          couple_id: string
          created_at?: string
          id?: string
          question: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          asked_by?: string
          couple_id?: string
          created_at?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      rating_scores: {
        Row: {
          rating_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          rating_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          rating_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rating_scores_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          category: string
          couple_id: string
          created_at: string
          id: string
          location: string | null
          note: string | null
          status: string
          title: string
        }
        Insert: {
          category: string
          couple_id: string
          created_at?: string
          id?: string
          location?: string | null
          note?: string | null
          status?: string
          title: string
        }
        Update: {
          category?: string
          couple_id?: string
          created_at?: string
          id?: string
          location?: string | null
          note?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          added_by: string
          claimed: boolean
          couple_id: string
          created_at: string
          id: string
          notes: string | null
          title: string
          url: string | null
        }
        Insert: {
          added_by: string
          claimed?: boolean
          couple_id: string
          created_at?: string
          id?: string
          notes?: string | null
          title: string
          url?: string | null
        }
        Update: {
          added_by?: string
          claimed?: boolean
          couple_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_couple_invite: {
        Args: { p_invite_code: string }
        Returns: undefined
      }
      accept_couple_request: {
        Args: { p_invite_id: string }
        Returns: undefined
      }
      cancel_couple_request: {
        Args: { p_invite_id: string }
        Returns: undefined
      }
      create_couple_and_invite: {
        Args: { p_invitee_email: string }
        Returns: {
          invite_code: string
          invite_id: string
        }[]
      }
      decline_couple_invite: {
        Args: { p_invite_code: string }
        Returns: undefined
      }
      decline_couple_request: {
        Args: { p_invite_id: string }
        Returns: undefined
      }
      delete_my_account: { Args: never; Returns: undefined }
      find_user_by_username: {
        Args: { p_username: string }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
          username: string
        }[]
      }
      get_incoming_couple_requests: {
        Args: never
        Returns: {
          created_at: string
          invite_id: string
          inviter_avatar_url: string
          inviter_display_name: string
          inviter_user_id: string
          inviter_username: string
        }[]
      }
      get_my_couple_id: { Args: never; Returns: string }
      get_outgoing_couple_requests: {
        Args: never
        Returns: {
          created_at: string
          invite_code: string
          invite_id: string
          invitee_email: string
          target_avatar_url: string
          target_display_name: string
          target_user_id: string
          target_username: string
        }[]
      }
      is_username_available: { Args: { p_username: string }; Returns: boolean }
      leave_couple: { Args: never; Returns: undefined }
      send_couple_request: {
        Args: { p_username: string }
        Returns: {
          invite_id: string
          target_avatar_url: string
          target_display_name: string
          target_user_id: string
          target_username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
