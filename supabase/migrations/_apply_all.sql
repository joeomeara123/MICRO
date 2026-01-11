-- ============================================================
-- CONSOLIDATED MIGRATIONS FOR SUPABASE DASHBOARD
-- ============================================================
-- Copy this entire file and paste it into Supabase SQL Editor
-- Navigate to: https://supabase.com/dashboard/project/etwdxydfcxlqhbqzzdqs/sql
-- Then click "Run" to execute all migrations at once
-- ============================================================

-- ============================================================
-- Migration 1: Create Enums (20260111000001_create_enums.sql)
-- ============================================================

-- Integration providers supported by the app
CREATE TYPE integration_provider AS ENUM (
    'google',
    'notion',
    'slack',
    'linear',
    'jira'
);

-- Status of an OAuth connection
CREATE TYPE connection_status AS ENUM (
    'active',
    'token_expired',
    'refresh_failed',
    'revoked',
    'disconnected'
);

-- Source of a task
CREATE TYPE task_source AS ENUM (
    'notion',
    'email',
    'slack',
    'ai_suggestion',
    'manual'
);

-- Task priority levels
CREATE TYPE task_priority AS ENUM (
    'high',
    'medium',
    'low'
);

-- Task status after user action
CREATE TYPE task_status AS ENUM (
    'pending',
    'approved',
    'dismissed',
    'snoozed'
);

-- ============================================================
-- Migration 2: Create connected_apps Table
-- ============================================================

-- Create the connected_apps table
CREATE TABLE connected_apps (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User reference (required)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Integration details
    provider integration_provider NOT NULL,
    status connection_status NOT NULL DEFAULT 'active',

    -- Provider account information
    provider_account_id TEXT,
    provider_account_name TEXT,
    provider_account_email TEXT,

    -- OAuth scopes granted during authorization
    granted_scopes TEXT[],

    -- Timestamps
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Each user can only have one connection per provider
    CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on row changes
CREATE TRIGGER update_connected_apps_updated_at
    BEFORE UPDATE ON connected_apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE connected_apps ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own connected apps
CREATE POLICY "Users can view own connected apps"
    ON connected_apps
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can INSERT their own connected apps
CREATE POLICY "Users can create own connected apps"
    ON connected_apps
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can UPDATE their own connected apps
CREATE POLICY "Users can update own connected apps"
    ON connected_apps
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can DELETE their own connected apps
CREATE POLICY "Users can delete own connected apps"
    ON connected_apps
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add table comment
COMMENT ON TABLE connected_apps IS 'Tracks OAuth integrations (Google, Notion, Slack, etc.) for each user';

-- ============================================================
-- Migration 3: Create oauth_tokens Table (Server-Side Only)
-- ============================================================

-- SECURITY NOTE:
-- This table intentionally has NO RLS policies.
-- With RLS enabled and no policies, the table is completely inaccessible from the client.
-- Only Supabase Edge Functions using the service_role key can read/write this table.

-- Create the oauth_tokens table
CREATE TABLE oauth_tokens (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference to the connected app (required)
    connected_app_id UUID NOT NULL REFERENCES connected_apps(id) ON DELETE CASCADE,

    -- OAuth token data
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on connected_app_id for fast lookups
CREATE INDEX idx_oauth_tokens_connected_app_id ON oauth_tokens(connected_app_id);

-- Use the existing trigger function from connected_apps migration
CREATE TRIGGER update_oauth_tokens_updated_at
    BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
-- CRITICAL: With RLS enabled and NO policies, this table is inaccessible from client
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- NO RLS POLICIES INTENTIONALLY
-- This table should ONLY be accessed by Edge Functions using service_role key

-- Add table comment explaining the security model
COMMENT ON TABLE oauth_tokens IS 'OAuth access/refresh tokens. SERVER-SIDE ONLY - no RLS policies means clients cannot access. Use Edge Functions with service_role key.';

-- ============================================================
-- Migration 4: Create tasks Table
-- ============================================================

-- Create tasks table
CREATE TABLE public.tasks (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User ownership
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Source information
    source task_source NOT NULL,
    source_id TEXT, -- External ID from source system (nullable for manual tasks)

    -- Task content
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,

    -- Priority and status (use enums)
    priority_level task_priority DEFAULT 'medium',
    status task_status DEFAULT 'pending',

    -- Due date
    due_date TIMESTAMPTZ,

    -- Source-specific metadata (JSONB for flexibility)
    metadata JSONB DEFAULT '{}',

    -- Lifecycle columns
    snoozed_until TIMESTAMPTZ,
    actioned_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ, -- Soft delete

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comments for documentation
COMMENT ON TABLE public.tasks IS 'Core table for user tasks from various sources';
COMMENT ON COLUMN public.tasks.source IS 'Origin of the task: notion, email, slack, ai_suggestion, manual';
COMMENT ON COLUMN public.tasks.source_id IS 'External ID from source system for deduplication';
COMMENT ON COLUMN public.tasks.metadata IS 'Source-specific data stored as JSONB';
COMMENT ON COLUMN public.tasks.snoozed_until IS 'Task hidden until this timestamp';
COMMENT ON COLUMN public.tasks.actioned_at IS 'When user took action (approved/dismissed)';
COMMENT ON COLUMN public.tasks.deleted_at IS 'Soft delete timestamp - null means active';

-- Index for feed queries: fetch pending tasks for user
-- Excludes soft-deleted tasks for efficiency
CREATE INDEX idx_tasks_user_feed
ON public.tasks (user_id, status)
WHERE deleted_at IS NULL;

-- Index for deduplication: prevent duplicate imports from same source
CREATE INDEX idx_tasks_deduplication
ON public.tasks (user_id, source, source_id);

-- Trigger for auto-updating updated_at
-- Reuses function created in connected_apps migration
CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own tasks
-- SELECT: Users can read their own tasks
CREATE POLICY "Users can select own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Users can create tasks for themselves
CREATE POLICY "Users can insert own tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own tasks
CREATE POLICY "Users can update own tasks"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- VERIFICATION QUERIES (Run after migrations to verify)
-- ============================================================
-- Uncomment and run these to verify the migrations worked:

-- Check enums exist:
-- SELECT typname FROM pg_type WHERE typname IN ('integration_provider', 'connection_status', 'task_source', 'task_priority', 'task_status');

-- Check tables exist:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('connected_apps', 'oauth_tokens', 'tasks');

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('connected_apps', 'oauth_tokens', 'tasks');
