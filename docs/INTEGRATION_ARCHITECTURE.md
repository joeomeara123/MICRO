# Integration Architecture

> How users connect their accounts and how the app personalizes to each user.

---

## Overview

Micro connects to multiple services to pull tasks and enable AI-assisted responses:

| Service | Purpose | OAuth |
|---------|---------|-------|
| **Google** | Primary auth + Gmail access | Sign-in (includes Gmail scopes) |
| **Notion** | Task source | Separate connection |
| **Slack** | Messages + links | Separate connection |
| **Future** | Linear, Jira, etc. | Separate connections |

---

## User Flow

```
1. SIGN IN WITH GOOGLE
   └── Creates account + grants Gmail access in one step

2. SETTINGS → CONNECTED APPS
   ┌─────────────────────────────────────────────┐
   │  ✅ Google (Gmail)     joe@palindrom.ai     │
   │  ⬜ Notion              [Connect]            │
   │  ⬜ Slack               [Connect]            │
   │  ⬜ Linear              [Connect]            │
   └─────────────────────────────────────────────┘

3. TAP "CONNECT NOTION"
   └── Opens OAuth in browser → User authorizes → Token stored

4. TASKS PERSONALIZED
   └── App pulls YOUR tasks from connected services
```

---

## Database Schema

```sql
-- Core tables in Supabase

users
├── id (UUID, from Supabase Auth)
├── email
├── display_name
└── avatar_url

connected_apps
├── id (UUID)
├── user_id → users.id
├── provider (enum: google | notion | slack | linear | jira)
├── status (enum: active | token_expired | refresh_failed | revoked | disconnected)
├── provider_account_id
├── provider_account_name
├── provider_account_email
├── granted_scopes[]
├── connected_at
└── last_sync_at

oauth_tokens (encrypted, server-side only)
├── id (UUID)
├── connected_app_id → connected_apps.id
├── user_id → users.id
├── access_token_encrypted (BYTEA)
├── refresh_token_encrypted (BYTEA)
├── expires_at
└── token_type
```

---

## Security Model

**Critical: Tokens never leave the server.**

```
┌─────────────────────────────────────────────────────────────┐
│  Mobile App                     Supabase Edge Functions      │
│  ──────────                     ────────────────────────     │
│                                                              │
│  "Fetch my emails"  ──────────▶  1. Get user's token         │
│                                  2. Decrypt token            │
│                                  3. Call Gmail API           │
│                                  4. Return data (not token)  │
│  ◀────────────────────────────  "Here are your emails"       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

- Tokens encrypted with pgcrypto (AES-256)
- Encryption key in Supabase Vault
- Client can NEVER read oauth_tokens table (RLS policy)
- All API calls proxied through Edge Functions

---

## Services Layer

```
services/
├── supabase.ts              # Supabase client initialization
├── auth/
│   ├── google-auth.ts       # Google OAuth + Gmail scopes
│   └── session.ts           # Session management
├── integrations/
│   ├── base-integration.ts  # Abstract base class
│   ├── notion.ts            # Notion OAuth flow
│   ├── slack.ts             # Slack OAuth flow
│   └── gmail.ts             # Gmail (uses Google token)
└── api/
    ├── notion-client.ts     # Notion API wrapper
    ├── gmail-client.ts      # Gmail API wrapper
    └── slack-client.ts      # Slack API wrapper
```

---

## Google Sign-In (with Gmail)

One sign-in provides both authentication AND Gmail access:

```typescript
const GOOGLE_SCOPES = [
  'openid', 'email', 'profile',           // Auth
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];
```

Flow:
1. expo-auth-session opens Google OAuth
2. User grants all permissions at once
3. Edge Function exchanges code for tokens
4. Creates user + stores encrypted tokens
5. Returns Supabase session to app

---

## Adding New Integrations

To add Linear, Jira, or any new service:

1. **Database**: Add to `integration_provider` enum
2. **Integration class**: Create `LinearIntegration` extending `BaseIntegration`
3. **API client**: Create `linear-client.ts`
4. **Edge Functions**: Token exchange + API proxy support
5. **UI**: Add to Settings screen

Pattern is established — just follow existing integrations.

---

## Environment Variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Google OAuth
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=

# Notion OAuth
EXPO_PUBLIC_NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=  # Server-side only

# Slack OAuth
EXPO_PUBLIC_SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=   # Server-side only
```

---

## Token Refresh

Handled automatically by Edge Functions:

1. API call comes in
2. Check if token expires within 5 minutes
3. If yes, use refresh_token to get new access_token
4. Store new tokens (encrypted)
5. Continue with API call

If refresh fails → Mark connection as `refresh_failed` → User prompted to reconnect

---

*Last updated: January 2026*
