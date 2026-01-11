-- Migration: Create oauth_tokens Table
-- Purpose: Securely store OAuth tokens for server-side only access
-- Date: 2026-01-11
-- Dependencies: Requires connected_apps table from 20260111000002_create_connected_apps.sql

-- SECURITY NOTE:
-- This table intentionally has NO RLS policies.
-- With RLS enabled and no policies, the table is completely inaccessible from the client.
-- Only Supabase Edge Functions using the service_role key can read/write this table.
-- This ensures OAuth tokens (sensitive credentials) are never exposed to the client.

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
-- Do NOT add any policies here - tokens must remain server-side only

-- Add table comment explaining the security model
COMMENT ON TABLE oauth_tokens IS 'OAuth access/refresh tokens. SERVER-SIDE ONLY - no RLS policies means clients cannot access. Use Edge Functions with service_role key.';
