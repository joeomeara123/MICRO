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
    PostgrestVersion: "14.1"
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
      connected_apps: {
        Row: {
          connected_at: string
          created_at: string
          granted_scopes: string[] | null
          id: string
          last_sync_at: string | null
          provider: Database["public"]["Enums"]["integration_provider"]
          provider_account_email: string | null
          provider_account_id: string | null
          provider_account_name: string | null
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          created_at?: string
          granted_scopes?: string[] | null
          id?: string
          last_sync_at?: string | null
          provider: Database["public"]["Enums"]["integration_provider"]
          provider_account_email?: string | null
          provider_account_id?: string | null
          provider_account_name?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_at?: string
          created_at?: string
          granted_scopes?: string[] | null
          id?: string
          last_sync_at?: string | null
          provider?: Database["public"]["Enums"]["integration_provider"]
          provider_account_email?: string | null
          provider_account_id?: string | null
          provider_account_name?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_tokens: {
        Row: {
          access_token: string
          connected_app_id: string
          created_at: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_app_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_app_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_tokens_connected_app_id_fkey"
            columns: ["connected_app_id"]
            isOneToOne: false
            referencedRelation: "connected_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actioned_at: string | null
          category: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority_level: Database["public"]["Enums"]["task_priority"] | null
          snoozed_until: string | null
          source: Database["public"]["Enums"]["task_source"]
          source_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actioned_at?: string | null
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority_level?: Database["public"]["Enums"]["task_priority"] | null
          snoozed_until?: string | null
          source: Database["public"]["Enums"]["task_source"]
          source_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actioned_at?: string | null
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority_level?: Database["public"]["Enums"]["task_priority"] | null
          snoozed_until?: string | null
          source?: Database["public"]["Enums"]["task_source"]
          source_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
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
      connection_status:
        | "active"
        | "token_expired"
        | "refresh_failed"
        | "revoked"
        | "disconnected"
      integration_provider: "google" | "notion" | "slack" | "linear" | "jira"
      task_priority: "high" | "medium" | "low"
      task_source: "notion" | "email" | "slack" | "ai_suggestion" | "manual"
      task_status: "pending" | "approved" | "dismissed" | "snoozed"
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
    Enums: {
      connection_status: [
        "active",
        "token_expired",
        "refresh_failed",
        "revoked",
        "disconnected",
      ],
      integration_provider: ["google", "notion", "slack", "linear", "jira"],
      task_priority: ["high", "medium", "low"],
      task_source: ["notion", "email", "slack", "ai_suggestion", "manual"],
      task_status: ["pending", "approved", "dismissed", "snoozed"],
    },
  },
} as const
