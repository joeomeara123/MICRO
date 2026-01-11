# Supabase Database Setup

This folder contains the Supabase configuration and database migrations for the Micro app.

## Folder Structure

```
supabase/
├── config.toml       # Supabase CLI configuration
├── migrations/       # SQL migration files (versioned)
├── .temp/            # Temporary files (gitignored)
└── README.md         # This file
```

## Migration Workflow

### Creating a New Migration

1. Create a new SQL file in `migrations/` with timestamp prefix:
   ```
   migrations/20260111000001_create_enums.sql
   ```

2. Write your SQL (CREATE TABLE, ALTER TABLE, etc.)

3. Apply to remote Supabase:
   - **Option A**: Copy SQL to Supabase Dashboard → SQL Editor → Run
   - **Option B**: Use `supabase db push` (requires local docker)

### Migration Naming Convention

```
YYYYMMDDHHMMSS_description.sql
```

Example: `20260111000001_create_enums.sql`

### Applying Migrations to Remote Supabase

**Via Dashboard (Recommended for this project):**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of each migration file
3. Run in order (lowest timestamp first)

**Via CLI (requires Docker):**
```bash
supabase link --project-ref <project-id>
supabase db push
```

### Generating TypeScript Types

After applying migrations:
```bash
supabase link --project-ref <project-id>
supabase gen types typescript --linked > types/database.ts
```

## Tables Created

| Table | Purpose |
|-------|---------|
| `connected_apps` | Tracks OAuth integrations per user |
| `oauth_tokens` | Stores OAuth tokens (server-side only) |
| `tasks` | User tasks from various sources |

## Security Notes

- **RLS is enabled** on all tables
- **oauth_tokens has NO client RLS policies** - only Edge Functions can access
- Always use `auth.uid() = user_id` pattern in RLS policies
