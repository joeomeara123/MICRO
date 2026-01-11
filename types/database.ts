/**
 * Database Types
 *
 * These types are manually created to match the Supabase schema.
 * After applying migrations (US-006), you can regenerate these with:
 * supabase gen types typescript --linked > types/database.ts
 *
 * @see supabase/migrations/ for the source of truth
 */

// ============================================================
// Enums (from 20260111000001_create_enums.sql)
// ============================================================

export type IntegrationProvider = 'google' | 'notion' | 'slack' | 'linear' | 'jira';

export type ConnectionStatus =
  | 'active'
  | 'token_expired'
  | 'refresh_failed'
  | 'revoked'
  | 'disconnected';

export type TaskSource = 'notion' | 'email' | 'slack' | 'ai_suggestion' | 'manual';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'approved' | 'dismissed' | 'snoozed';

// ============================================================
// JSON type for JSONB columns
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================
// Table Types
// ============================================================

/**
 * connected_apps table - tracks OAuth integrations per user
 */
export interface ConnectedAppRow {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  status: ConnectionStatus;
  provider_account_id: string | null;
  provider_account_name: string | null;
  provider_account_email: string | null;
  granted_scopes: string[] | null;
  connected_at: string;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAppInsert {
  id?: string;
  user_id: string;
  provider: IntegrationProvider;
  status?: ConnectionStatus;
  provider_account_id?: string | null;
  provider_account_name?: string | null;
  provider_account_email?: string | null;
  granted_scopes?: string[] | null;
  connected_at?: string;
  last_sync_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectedAppUpdate {
  id?: string;
  user_id?: string;
  provider?: IntegrationProvider;
  status?: ConnectionStatus;
  provider_account_id?: string | null;
  provider_account_name?: string | null;
  provider_account_email?: string | null;
  granted_scopes?: string[] | null;
  connected_at?: string;
  last_sync_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * oauth_tokens table - server-side only token storage
 * Note: This table has no RLS policies, only accessible via service_role
 */
export interface OAuthTokenRow {
  id: string;
  connected_app_id: string;
  access_token: string;
  refresh_token: string | null;
  token_type: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OAuthTokenInsert {
  id?: string;
  connected_app_id: string;
  access_token: string;
  refresh_token?: string | null;
  token_type?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OAuthTokenUpdate {
  id?: string;
  connected_app_id?: string;
  access_token?: string;
  refresh_token?: string | null;
  token_type?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * tasks table - core task storage with polymorphic metadata
 */
export interface TaskRow {
  id: string;
  user_id: string;
  source: TaskSource;
  source_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  priority_level: TaskPriority | null;
  status: TaskStatus;
  due_date: string | null;
  metadata: Json;
  snoozed_until: string | null;
  actioned_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  id?: string;
  user_id: string;
  source: TaskSource;
  source_id?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  priority_level?: TaskPriority | null;
  status?: TaskStatus;
  due_date?: string | null;
  metadata?: Json;
  snoozed_until?: string | null;
  actioned_at?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TaskUpdate {
  id?: string;
  user_id?: string;
  source?: TaskSource;
  source_id?: string | null;
  title?: string;
  description?: string | null;
  category?: string | null;
  priority_level?: TaskPriority | null;
  status?: TaskStatus;
  due_date?: string | null;
  metadata?: Json;
  snoozed_until?: string | null;
  actioned_at?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// Database Schema Type (for Supabase client)
// ============================================================

export interface Database {
  public: {
    Tables: {
      connected_apps: {
        Row: ConnectedAppRow;
        Insert: ConnectedAppInsert;
        Update: ConnectedAppUpdate;
        Relationships: [
          {
            foreignKeyName: 'connected_apps_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      oauth_tokens: {
        Row: OAuthTokenRow;
        Insert: OAuthTokenInsert;
        Update: OAuthTokenUpdate;
        Relationships: [
          {
            foreignKeyName: 'oauth_tokens_connected_app_id_fkey';
            columns: ['connected_app_id'];
            isOneToOne: false;
            referencedRelation: 'connected_apps';
            referencedColumns: ['id'];
          }
        ];
      };
      tasks: {
        Row: TaskRow;
        Insert: TaskInsert;
        Update: TaskUpdate;
        Relationships: [
          {
            foreignKeyName: 'tasks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      integration_provider: IntegrationProvider;
      connection_status: ConnectionStatus;
      task_source: TaskSource;
      task_priority: TaskPriority;
      task_status: TaskStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
