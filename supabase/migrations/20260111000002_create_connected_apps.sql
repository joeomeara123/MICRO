-- Migration: Create connected_apps Table
-- Purpose: Track OAuth integrations for each user
-- Date: 2026-01-11
-- Dependencies: Requires enums from 20260111000001_create_enums.sql

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
