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
  metadata: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
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
      };
      oauth_tokens: {
        Row: OAuthTokenRow;
        Insert: OAuthTokenInsert;
        Update: OAuthTokenUpdate;
      };
      tasks: {
        Row: TaskRow;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
    };
    Enums: {
      integration_provider: IntegrationProvider;
      connection_status: ConnectionStatus;
      task_source: TaskSource;
      task_priority: TaskPriority;
      task_status: TaskStatus;
    };
  };
}
