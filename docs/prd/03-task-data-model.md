# PRD 03: Task Data Model

> **Status**: Ready for Implementation
> **Priority**: P0 (Foundational)
> **Dependencies**: PRD 02 (Authentication) ✅ Complete
> **Estimated Stories**: 10
> **Branch**: `ralph/03-task-data-model`

---

## 1. Introduction

This PRD establishes the database foundation for the Micro app. Currently, the app displays hardcoded sample tasks with no persistence. Users cannot:

- Save task actions (approve/dismiss) across sessions
- Track which integrations they've connected
- Have their data synced across devices

### Problem Statement

The app needs a proper data layer before we can build real integrations (Notion, Gmail, Slack). Without a database schema, we cannot:

1. Store tasks fetched from external services
2. Track task status changes from swipe actions
3. Know which OAuth integrations a user has connected
4. Securely store OAuth tokens for API calls

### Goals

1. **Create 3 database tables**: `connected_apps`, `oauth_tokens`, `tasks`
2. **Implement Row Level Security (RLS)**: Users can only access their own data
3. **Secure token storage**: `oauth_tokens` table is server-side only (no client access)
4. **Generate TypeScript types**: Full type safety for database operations
5. **Build task service layer**: Reusable CRUD operations for tasks
6. **Connect feed to database**: Real queries with sample data fallback

### Decisions Made (From Research)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | All 3 tables | Foundational dependencies require it |
| Metadata pattern | Hybrid (typed + JSONB) | Performance on common fields, flexibility for source-specific |
| RLS level | Strict | oauth_tokens completely inaccessible from client |
| Feed connection | Partial | Service layer + sample fallback for demos |
| Token migration | Defer | Create structure now, migrate Google tokens in PRD 06 |

---

## 2. Goals

- [ ] Create `connected_apps` table to track user's OAuth integrations
- [ ] Create `oauth_tokens` table with server-side-only access for secure token storage
- [ ] Create `tasks` table with polymorphic support for multiple sources
- [ ] Enable RLS on all tables with appropriate policies
- [ ] Generate TypeScript types from database schema
- [ ] Create task service layer with CRUD operations
- [ ] Update feed to query from database with sample data fallback
- [ ] All changes pass typecheck (`npx tsc --noEmit`)

---

## 3. User Stories

### US-001: Create Supabase Local Development Setup

**Description**: As a developer, I need the Supabase CLI configured locally so that I can create and test database migrations before deploying.

**Acceptance Criteria**:
- [ ] Supabase CLI installed globally (`npm install -g supabase`)
- [ ] `supabase/` folder created at project root
- [ ] `supabase init` run to create config structure
- [ ] `supabase/migrations/` folder exists for SQL migrations
- [ ] `supabase/config.toml` configured with project settings
- [ ] `.gitignore` updated to exclude `supabase/.temp/` if present
- [ ] README section added to `supabase/` explaining migration workflow
- [ ] Typecheck passes: `npx tsc --noEmit`

**Technical Notes**:
```bash
# Commands to run
npm install -g supabase
cd /path/to/micro-app
supabase init
```

The `supabase/` folder will contain:
- `config.toml` - Local configuration
- `migrations/` - SQL migration files (timestamped)
- `seed.sql` - Optional seed data

---

### US-002: Create Database Enums

**Description**: As a developer, I need PostgreSQL enums defined so that columns have constrained, type-safe values.

**Acceptance Criteria**:
- [ ] Migration file created: `supabase/migrations/20260111000001_create_enums.sql`
- [ ] `integration_provider` enum created with values: `google`, `notion`, `slack`, `linear`, `jira`
- [ ] `connection_status` enum created with values: `active`, `token_expired`, `refresh_failed`, `revoked`, `disconnected`
- [ ] `task_source` enum created with values: `notion`, `email`, `slack`, `ai_suggestion`, `manual`
- [ ] `task_priority` enum created with values: `high`, `medium`, `low`
- [ ] `task_status` enum created with values: `pending`, `approved`, `dismissed`, `snoozed`
- [ ] Migration can be applied without errors: `supabase db push` (or via dashboard)
- [ ] Enums visible in Supabase dashboard under Database → Types
- [ ] Typecheck passes: `npx tsc --noEmit`

**SQL Reference**:
```sql
-- integration_provider: Which service the user connected
CREATE TYPE integration_provider AS ENUM (
  'google',   -- Google (includes Gmail)
  'notion',   -- Notion workspace
  'slack',    -- Slack workspace
  'linear',   -- Linear (future)
  'jira'      -- Jira (future)
);

-- connection_status: Health of the OAuth connection
CREATE TYPE connection_status AS ENUM (
  'active',           -- Working normally
  'token_expired',    -- Access token expired, needs refresh
  'refresh_failed',   -- Refresh token failed, needs re-auth
  'revoked',          -- User revoked access in provider settings
  'disconnected'      -- User disconnected in our app
);

-- task_source: Where the task originated
CREATE TYPE task_source AS ENUM (
  'notion',        -- From Notion database
  'email',         -- From Gmail
  'slack',         -- From Slack message
  'ai_suggestion', -- AI-generated suggestion
  'manual'         -- User-created task
);

-- task_priority: Urgency level
CREATE TYPE task_priority AS ENUM (
  'high',
  'medium',
  'low'
);

-- task_status: Current state of the task
CREATE TYPE task_status AS ENUM (
  'pending',    -- Awaiting action
  'approved',   -- Swiped right / completed
  'dismissed',  -- Swiped left / rejected
  'snoozed'     -- Deferred to later
);
```

---

### US-003: Create connected_apps Table

**Description**: As a system, I need to track which OAuth integrations each user has connected so that I know which services to sync.

**Acceptance Criteria**:
- [ ] Migration file created: `supabase/migrations/20260111000002_create_connected_apps.sql`
- [ ] Table `connected_apps` created with all columns (see schema below)
- [ ] Primary key: `id` (UUID, auto-generated)
- [ ] Foreign key: `user_id` references `auth.users(id)` with `ON DELETE CASCADE`
- [ ] Unique constraint on `(user_id, provider)` - one connection per provider per user
- [ ] `created_at` and `updated_at` columns with defaults
- [ ] Trigger created for auto-updating `updated_at` on row changes
- [ ] RLS enabled on table
- [ ] RLS policy created: users can SELECT/INSERT/UPDATE/DELETE only their own rows
- [ ] Migration applied successfully
- [ ] Table visible in Supabase dashboard
- [ ] Typecheck passes: `npx tsc --noEmit`

**Schema**:
```sql
CREATE TABLE connected_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider integration_provider NOT NULL,
  status connection_status NOT NULL DEFAULT 'active',

  -- Provider account info (what we can show the user)
  provider_account_id TEXT,           -- e.g., Google user ID
  provider_account_name TEXT,         -- e.g., "Joe O'Meara"
  provider_account_email TEXT,        -- e.g., "joe@example.com"

  -- OAuth metadata
  granted_scopes TEXT[] DEFAULT '{}', -- Scopes user granted

  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One connection per provider per user
  UNIQUE(user_id, provider)
);

-- Auto-update updated_at
CREATE TRIGGER update_connected_apps_updated_at
  BEFORE UPDATE ON connected_apps
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- RLS
ALTER TABLE connected_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own connections"
  ON connected_apps FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### US-004: Create oauth_tokens Table (Server-Side Only)

**Description**: As a system, I need to securely store OAuth tokens so that Edge Functions can make API calls on behalf of users.

**Acceptance Criteria**:
- [ ] Migration file created: `supabase/migrations/20260111000003_create_oauth_tokens.sql`
- [ ] Table `oauth_tokens` created with all columns (see schema below)
- [ ] Primary key: `id` (UUID, auto-generated)
- [ ] Foreign key: `connected_app_id` references `connected_apps(id)` with `ON DELETE CASCADE`
- [ ] Index created on `connected_app_id` for fast lookups
- [ ] RLS enabled on table
- [ ] **NO RLS policies created** - this makes the table inaccessible from client
- [ ] Comment added explaining server-side-only access pattern
- [ ] Migration applied successfully
- [ ] Verify in Supabase: querying this table from client returns empty/error
- [ ] Typecheck passes: `npx tsc --noEmit`

**Schema**:
```sql
-- OAuth tokens - SERVER SIDE ONLY
-- No RLS policies = no client access
-- Only Edge Functions with service_role key can read/write

CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connected_app_id UUID NOT NULL REFERENCES connected_apps(id) ON DELETE CASCADE,

  -- Token storage (will be encrypted via pgcrypto in Edge Functions)
  access_token TEXT NOT NULL,
  refresh_token TEXT,

  -- Token metadata
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by connected app
CREATE INDEX idx_oauth_tokens_connected_app_id ON oauth_tokens(connected_app_id);

-- Auto-update updated_at
CREATE TRIGGER update_oauth_tokens_updated_at
  BEFORE UPDATE ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Enable RLS but create NO policies
-- This means: authenticated users have zero access
-- Only service_role key (Edge Functions) can access
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE oauth_tokens IS
  'Server-side only. No RLS policies = no client access. Use service_role key in Edge Functions.';
```

**Security Note**: The `access_token` and `refresh_token` columns store tokens in plain text in this migration. When we implement Edge Functions (PRD 06), we'll add encryption using `pgcrypto`. For now, RLS prevents any client access.

---

### US-005: Create tasks Table

**Description**: As a user, I need my tasks stored in the database so that swipe actions persist and I see the same tasks across devices.

**Acceptance Criteria**:
- [ ] Migration file created: `supabase/migrations/20260111000004_create_tasks.sql`
- [ ] Table `tasks` created with all columns (see schema below)
- [ ] Primary key: `id` (UUID, auto-generated)
- [ ] Foreign key: `user_id` references `auth.users(id)` with `ON DELETE CASCADE`
- [ ] Typed columns for common fields: `title`, `description`, `source`, `status`, `priority_level`, `category`, `due_date`
- [ ] JSONB `metadata` column for source-specific data
- [ ] Soft delete via `deleted_at` column (nullable)
- [ ] Index on `(user_id, status)` for feed queries
- [ ] Index on `(user_id, source, source_id)` for deduplication
- [ ] RLS enabled with policy: users can only access their own tasks
- [ ] Migration applied successfully
- [ ] Typecheck passes: `npx tsc --noEmit`

**Schema**:
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Source identification (for deduplication)
  source task_source NOT NULL,
  source_id TEXT,  -- External ID from source system (e.g., Notion page ID)

  -- Common task fields (typed for performance)
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority_level task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  due_date DATE,

  -- Source-specific data (flexible JSONB)
  -- Examples:
  --   Notion: { "page_id": "...", "database_id": "...", "properties": {...} }
  --   Email: { "message_id": "...", "thread_id": "...", "from": "...", "subject": "..." }
  --   Slack: { "channel_id": "...", "message_ts": "...", "thread_ts": "..." }
  metadata JSONB DEFAULT '{}',

  -- Task lifecycle
  snoozed_until TIMESTAMPTZ,  -- If snoozed, when to resurface
  actioned_at TIMESTAMPTZ,     -- When user took action (approve/dismiss)

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status)
  WHERE deleted_at IS NULL;  -- Partial index excludes deleted

CREATE INDEX idx_tasks_dedup ON tasks(user_id, source, source_id)
  WHERE source_id IS NOT NULL;  -- For checking duplicates on sync

CREATE INDEX idx_tasks_snoozed ON tasks(user_id, snoozed_until)
  WHERE status = 'snoozed' AND snoozed_until IS NOT NULL;

-- Auto-update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### US-006: Apply Migrations to Supabase

**Description**: As a developer, I need the migrations applied to the remote Supabase project so that the tables exist in production.

**Acceptance Criteria**:
- [ ] All migration files reviewed for correctness
- [ ] Migrations applied to Supabase project via dashboard SQL editor OR `supabase db push`
- [ ] All 5 enums visible in Database → Types
- [ ] All 3 tables visible in Database → Tables: `connected_apps`, `oauth_tokens`, `tasks`
- [ ] RLS enabled indicator shows on all 3 tables
- [ ] Test query in SQL Editor: `SELECT * FROM tasks;` returns empty result (not error)
- [ ] Test query as authenticated user: Insert/select own task works
- [ ] Test query: `SELECT * FROM oauth_tokens;` from client returns empty (RLS blocks)
- [ ] Typecheck passes: `npx tsc --noEmit`

**Verification Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Paste each migration file and run
3. Check Database → Tables for new tables
4. Check Database → Types for new enums
5. Verify RLS is enabled (lock icon on tables)

---

### US-007: Generate TypeScript Types from Schema

**Description**: As a developer, I need TypeScript types generated from the database schema so that I have compile-time type safety for all queries.

**Acceptance Criteria**:
- [ ] Supabase CLI linked to project: `supabase link --project-ref <project-id>`
- [ ] Types generated: `supabase gen types typescript --linked > types/database.ts`
- [ ] `types/database.ts` file created with all table types
- [ ] Each table has `Row`, `Insert`, and `Update` type variants
- [ ] Enum types are generated as TypeScript unions
- [ ] `services/supabase.ts` updated to import and use `Database` type
- [ ] Supabase client is typed: `createClient<Database>(...)`
- [ ] Typecheck passes: `npx tsc --noEmit`

**Expected Generated Types** (partial):
```typescript
export type Database = {
  public: {
    Tables: {
      connected_apps: {
        Row: {
          id: string
          user_id: string
          provider: 'google' | 'notion' | 'slack' | 'linear' | 'jira'
          status: 'active' | 'token_expired' | 'refresh_failed' | 'revoked' | 'disconnected'
          // ... all columns
        }
        Insert: { /* ... */ }
        Update: { /* ... */ }
      }
      tasks: { /* ... */ }
      oauth_tokens: { /* ... */ }
    }
    Enums: {
      integration_provider: 'google' | 'notion' | 'slack' | 'linear' | 'jira'
      task_source: 'notion' | 'email' | 'slack' | 'ai_suggestion' | 'manual'
      // ... other enums
    }
  }
}
```

---

### US-008: Create Task TypeScript Interface with Metadata Types

**Description**: As a developer, I need a Task interface that extends the database types with source-specific metadata for type-safe handling in components.

**Acceptance Criteria**:
- [ ] `types/task.ts` file created
- [ ] Base `Task` type imported/extended from database types
- [ ] `NotionTaskMetadata` interface defined with: `page_id`, `database_id`, `properties`
- [ ] `EmailTaskMetadata` interface defined with: `message_id`, `thread_id`, `from`, `to`, `subject`
- [ ] `SlackTaskMetadata` interface defined with: `channel_id`, `message_ts`, `thread_ts`, `user_id`
- [ ] `TaskMetadata` union type created: `NotionTaskMetadata | EmailTaskMetadata | SlackTaskMetadata | Record<string, unknown>`
- [ ] `Task` interface exported matching current usage in `TaskCard.tsx`
- [ ] `TaskCard.tsx` updated to import `Task` from `types/task.ts` instead of inline definition
- [ ] No functionality changes to TaskCard - just import path update
- [ ] Typecheck passes: `npx tsc --noEmit`

**Type Definitions**:
```typescript
// types/task.ts
import { Database } from './database';

// Database row type
export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Enum types
export type TaskSource = Database['public']['Enums']['task_source'];
export type TaskStatus = Database['public']['Enums']['task_status'];
export type TaskPriority = Database['public']['Enums']['task_priority'];

// Source-specific metadata
export interface NotionTaskMetadata {
  page_id: string;
  database_id: string;
  properties?: Record<string, unknown>;
  url?: string;
}

export interface EmailTaskMetadata {
  message_id: string;
  thread_id: string;
  from: string;
  to: string[];
  subject: string;
  snippet?: string;
}

export interface SlackTaskMetadata {
  channel_id: string;
  channel_name?: string;
  message_ts: string;
  thread_ts?: string;
  sender_id: string;
  sender_name?: string;
}

export interface ManualTaskMetadata {
  created_by: 'user' | 'ai';
  notes?: string;
}

// Union of all metadata types
export type TaskMetadata =
  | NotionTaskMetadata
  | EmailTaskMetadata
  | SlackTaskMetadata
  | ManualTaskMetadata
  | Record<string, unknown>;

// Full Task interface for app usage
// Extends database row with typed metadata
export interface Task extends Omit<TaskRow, 'metadata'> {
  metadata: TaskMetadata;
  // Additional computed/display fields
  brand?: string;  // For logo display (e.g., "Notion", "Gmail")
  owner?: string;  // Display name of task owner
}
```

---

### US-009: Create Task Service Layer

**Description**: As a developer, I need a service layer that encapsulates all task database operations so that components don't directly call Supabase.

**Acceptance Criteria**:
- [ ] `services/tasks/` folder created
- [ ] `services/tasks/task-service.ts` file created
- [ ] `fetchUserTasks(userId, options?)` function: fetches pending tasks for feed
- [ ] `updateTaskStatus(taskId, status)` function: updates task status (approve/dismiss/snooze)
- [ ] `snoozeTask(taskId, until)` function: sets status to snoozed with snooze_until timestamp
- [ ] `createTask(task)` function: inserts new task (for manual creation)
- [ ] All functions are typed with proper return types
- [ ] All functions handle errors and return typed results (success/error pattern)
- [ ] Console logging added for debugging (can be removed later)
- [ ] Typecheck passes: `npx tsc --noEmit`

**Service Implementation**:
```typescript
// services/tasks/task-service.ts
import { supabase } from '../supabase';
import { Task, TaskRow, TaskInsert, TaskStatus } from '../../types/task';

export interface TaskServiceResult<T> {
  data: T | null;
  error: Error | null;
}

export interface FetchTasksOptions {
  status?: TaskStatus | TaskStatus[];
  source?: string;
  limit?: number;
}

export async function fetchUserTasks(
  userId: string,
  options: FetchTasksOptions = {}
): Promise<TaskServiceResult<Task[]>> {
  const { status = 'pending', limit = 20 } = options;

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (Array.isArray(status)) {
    query = query.in('status', status);
  } else {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[TaskService] fetchUserTasks error:', error);
    return { data: null, error };
  }

  return { data: data as Task[], error: null };
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<TaskServiceResult<Task>> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      actioned_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('[TaskService] updateTaskStatus error:', error);
    return { data: null, error };
  }

  console.log('[TaskService] Task updated:', taskId, '→', status);
  return { data: data as Task, error: null };
}

export async function snoozeTask(
  taskId: string,
  until: Date
): Promise<TaskServiceResult<Task>> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'snoozed',
      snoozed_until: until.toISOString()
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('[TaskService] snoozeTask error:', error);
    return { data: null, error };
  }

  return { data: data as Task, error: null };
}

export async function createTask(
  task: TaskInsert
): Promise<TaskServiceResult<Task>> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('[TaskService] createTask error:', error);
    return { data: null, error };
  }

  return { data: data as Task, error: null };
}
```

---

### US-010: Connect Feed to Database with Sample Fallback

**Description**: As a user, I want my feed to show real tasks from the database, with sample tasks as fallback when the database is empty.

**Acceptance Criteria**:
- [ ] `app/(tabs)/index.tsx` updated to fetch tasks on mount
- [ ] Uses `useAuth` hook to get current user ID
- [ ] Uses `fetchUserTasks` from task service
- [ ] Loading state shown while fetching (spinner or skeleton)
- [ ] If tasks returned: display tasks from database
- [ ] If no tasks (empty array): display SAMPLE_TASKS as fallback for demo
- [ ] If error: show error message with retry button
- [ ] Swipe actions call `updateTaskStatus` to persist to database
- [ ] Console logs task status updates for debugging
- [ ] Verify on device: App loads, shows tasks or sample fallback
- [ ] Typecheck passes: `npx tsc --noEmit`

**Implementation Pattern**:
```typescript
// In app/(tabs)/index.tsx
const { user } = useAuth();
const [tasks, setTasks] = useState<Task[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function loadTasks() {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await fetchUserTasks(user.id);

    if (error) {
      setError('Failed to load tasks');
      setTasks(SAMPLE_TASKS); // Fallback
    } else if (data && data.length > 0) {
      setTasks(data);
    } else {
      setTasks(SAMPLE_TASKS); // Empty database, show samples
    }

    setIsLoading(false);
  }

  loadTasks();
}, [user]);

// Swipe handlers
const handleApprove = async (task: Task) => {
  await updateTaskStatus(task.id, 'approved');
  // Haptic feedback, remove from stack, etc.
};

const handleDismiss = async (task: Task) => {
  await updateTaskStatus(task.id, 'dismissed');
  // Haptic feedback, remove from stack, etc.
};
```

---

## 4. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | All tables must have RLS enabled |
| FR-02 | Users can only SELECT/INSERT/UPDATE/DELETE their own rows in `connected_apps` and `tasks` |
| FR-03 | No RLS policies on `oauth_tokens` - table is inaccessible from client |
| FR-04 | Tasks support polymorphic metadata via JSONB column |
| FR-05 | Soft delete supported via `deleted_at` column - queries exclude deleted by default |
| FR-06 | All timestamps use TIMESTAMPTZ (timezone-aware) |
| FR-07 | `updated_at` auto-updates on row changes via trigger |
| FR-08 | Unique constraint prevents duplicate integrations per user |
| FR-09 | Indexes exist for common query patterns (feed, deduplication) |
| FR-10 | TypeScript types generated from schema and used in all database operations |

---

## 5. Non-Goals (Out of Scope)

These are explicitly NOT part of PRD 03:

- **Edge Functions**: API proxy for external services (PRD 04+)
- **Token encryption**: pgcrypto encryption for oauth_tokens (PRD 06)
- **Notion sync logic**: Fetching tasks from Notion (PRD 04)
- **Gmail sync logic**: Fetching emails (PRD 06)
- **Slack sync logic**: Fetching messages (PRD 07)
- **Token migration**: Moving Google tokens from user metadata to oauth_tokens (PRD 06)
- **Real-time subscriptions**: Live task updates (future)
- **Offline support**: Local caching (Phase 3)

---

## 6. Technical Considerations

### Supabase CLI Workflow

```bash
# One-time setup
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>

# Generate types after schema changes
supabase gen types typescript --linked > types/database.ts

# Apply migrations to remote
supabase db push
```

### moddatetime Extension

The `updated_at` trigger uses Supabase's built-in `moddatetime` extension. If not available, create a custom function:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Hybrid Metadata Pattern

Common fields in typed columns, source-specific in JSONB:

| Typed Columns (Indexed) | JSONB Metadata (Flexible) |
|-------------------------|---------------------------|
| `title`, `description` | `page_id`, `database_id` (Notion) |
| `source`, `status`, `priority` | `message_id`, `thread_id` (Email) |
| `due_date`, `category` | `channel_id`, `message_ts` (Slack) |

This gives query performance on common fields while allowing source-specific flexibility.

---

## 7. Success Metrics

- [ ] All 3 tables exist in Supabase dashboard
- [ ] All 5 enums exist in Database → Types
- [ ] RLS enabled on all tables (visible in dashboard)
- [ ] TypeScript compiles without errors
- [ ] Generated types include all tables and enums
- [ ] Task service functions work (verified via console logs)
- [ ] Feed loads tasks from database
- [ ] Sample fallback works when database is empty
- [ ] Swipe actions persist to database (visible in Supabase Table Editor)

---

## 8. Open Questions

1. ~~**Metadata validation**: Strict schema or flexible JSONB?~~ → **Flexible JSONB for MVP**
2. ~~**Soft delete**: Add deleted_at column?~~ → **Yes, for data recovery**
3. ~~**Token migration**: Move Google tokens to oauth_tokens now?~~ → **Defer to PRD 06**
4. **Seed data**: Should we create a migration with sample tasks for new users? → Consider for polish phase

---

## 9. Appendix: Complete Migration Files

For reference, here are the complete migration file contents in order:

### File 1: `20260111000001_create_enums.sql`
```sql
-- Create all enums for the micro app

CREATE TYPE integration_provider AS ENUM ('google', 'notion', 'slack', 'linear', 'jira');
CREATE TYPE connection_status AS ENUM ('active', 'token_expired', 'refresh_failed', 'revoked', 'disconnected');
CREATE TYPE task_source AS ENUM ('notion', 'email', 'slack', 'ai_suggestion', 'manual');
CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('pending', 'approved', 'dismissed', 'snoozed');
```

### File 2: `20260111000002_create_connected_apps.sql`
(Full SQL as shown in US-003)

### File 3: `20260111000003_create_oauth_tokens.sql`
(Full SQL as shown in US-004)

### File 4: `20260111000004_create_tasks.sql`
(Full SQL as shown in US-005)

---

*Last updated: January 2026*
*Created following PRD skill workflow with clarifying questions*
