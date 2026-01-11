-- ============================================================
-- Migration: Create tasks table
-- Description: Core table for storing user tasks from various
--              sources (Notion, Email, Slack, AI, Manual)
-- Created: 2026-01-11
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
