-- Migration: Create Enums
-- Purpose: Define PostgreSQL enums for type-safe column values
-- Date: 2026-01-11

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
