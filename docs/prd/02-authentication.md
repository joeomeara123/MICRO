# PRD 02: Authentication

> **Status**: Ready for Implementation
> **Priority**: P0 (Foundational)
> **Dependencies**: None
> **Estimated Stories**: 8

---

## 1. Introduction

This PRD covers implementing Google Sign-In authentication for the Micro app. Users will sign in with their Google account, which also grants Gmail access (via extended OAuth scopes). The authentication state is managed by Supabase.

### Problem Statement

Currently, the sign-in screen is UI-only with no functional authentication. Users cannot:
- Create accounts
- Persist sessions across app restarts
- Access their Gmail for email integration

### Goals

1. Users can sign in with Google in one tap
2. Sessions persist across app restarts
3. Gmail access is granted during sign-in (extended scopes)
4. First-time users see onboarding, returning users go to feed
5. Foundation for connecting additional apps (Notion, Slack)

---

## 2. User Stories

### US-001: Create Supabase Project

**Description**: As a developer, I need a Supabase project configured so that I have a backend for authentication and data storage.

**Acceptance Criteria**:
- [ ] Supabase project created at supabase.com
- [ ] Project URL and anon key obtained
- [ ] `.env.local` file created with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local` added to `.gitignore`
- [ ] `.env.example` created with placeholder values for documentation
- [ ] Typecheck passes

---

### US-002: Create Google OAuth Credentials

**Description**: As a developer, I need Google Cloud OAuth credentials so that users can sign in with Google.

**Acceptance Criteria**:
- [ ] Google Cloud project created (or existing project used)
- [ ] OAuth consent screen configured
- [ ] iOS OAuth client ID created with correct bundle ID
- [ ] Web OAuth client ID created (required for expo-auth-session)
- [ ] Client IDs added to `.env.local`: `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- [ ] `.env.example` updated with Google credential placeholders
- [ ] Typecheck passes

---

### US-003: Initialize Supabase Client

**Description**: As a developer, I need a configured Supabase client so that the app can communicate with the backend.

**Acceptance Criteria**:
- [ ] `services/supabase.ts` created
- [ ] Supabase client initialized with URL and anon key from environment
- [ ] AsyncStorage configured for session persistence
- [ ] `autoRefreshToken` and `persistSession` enabled
- [ ] TypeScript types exported for Database (can be placeholder initially)
- [ ] Typecheck passes

---

### US-004: Create Auth Context and Hook

**Description**: As a developer, I need an auth context so that authentication state is accessible throughout the app.

**Acceptance Criteria**:
- [ ] `contexts/AuthContext.tsx` created
- [ ] Context provides: `user`, `session`, `isLoading`, `signIn`, `signOut`
- [ ] `hooks/useAuth.ts` created as convenience hook
- [ ] Context listens to Supabase auth state changes (`onAuthStateChange`)
- [ ] Loading state is true until initial session check completes
- [ ] Typecheck passes

---

### US-005: Implement Google Sign-In Flow

**Description**: As a user, I want to sign in with my Google account so that I can access the app.

**Acceptance Criteria**:
- [ ] `services/auth/google-auth.ts` created
- [ ] Uses `expo-auth-session` Google provider
- [ ] Requests scopes: `openid`, `email`, `profile`, `gmail.readonly`, `gmail.send`, `gmail.modify`
- [ ] Requests offline access (`access_type: 'offline'`) for refresh token
- [ ] On success, creates/updates user in Supabase Auth
- [ ] Stores Google tokens in Supabase (for Gmail access later)
- [ ] Returns Supabase session to app
- [ ] Verify on device: Tapping "Continue with Google" opens Google OAuth
- [ ] Typecheck passes

---

### US-006: Update Sign-In Screen with Real Auth

**Description**: As a user, I want the sign-in button to actually authenticate me.

**Acceptance Criteria**:
- [ ] `app/sign-in.tsx` updated to use `useGoogleAuth` hook
- [ ] Loading state shown while auth is in progress
- [ ] Error handling with user-friendly message on failure
- [ ] On success, navigation handled by auth state (not manual redirect)
- [ ] Verify on device: Sign in completes and user proceeds to next screen
- [ ] Typecheck passes

---

### US-007: Implement Protected Routes

**Description**: As a user, I should be redirected to sign-in if not authenticated, and to feed if authenticated.

**Acceptance Criteria**:
- [ ] `app/_layout.tsx` wrapped with `AuthProvider`
- [ ] Root layout checks auth state before rendering routes
- [ ] Unauthenticated users redirected to `/sign-in`
- [ ] Authenticated first-time users go to `/onboarding` (check AsyncStorage flag)
- [ ] Authenticated returning users go to `/(tabs)` feed
- [ ] Splash/loading screen shown during auth check
- [ ] Verify on device: Fresh app launch → sign-in screen. After sign-in → onboarding or feed.
- [ ] Typecheck passes

---

### US-008: Implement Sign Out

**Description**: As a user, I want to sign out so that I can switch accounts or secure my session.

**Acceptance Criteria**:
- [ ] Sign out button added to settings or profile area (can be temporary location)
- [ ] Calling `signOut` clears Supabase session
- [ ] User redirected to sign-in screen after sign out
- [ ] Google tokens cleared from storage
- [ ] Verify on device: Tapping sign out returns to sign-in screen
- [ ] Typecheck passes

---

## 3. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | App must use Google OAuth 2.0 for authentication |
| FR-02 | Gmail scopes must be requested during sign-in |
| FR-03 | Sessions must persist across app restarts |
| FR-04 | Unauthenticated users cannot access feed or settings |
| FR-05 | Auth state changes must be reactive (no manual refresh) |

---

## 4. Non-Goals (Out of Scope)

- Apple Sign-In (Phase 2)
- Email/password authentication
- Connecting Notion/Slack (covered in separate PRDs)
- Database schema for connected_apps (PRD 03)
- Storing Gmail tokens encrypted (PRD 03 - handled in Edge Functions)

---

## 5. Technical Considerations

### Expo Auth Session

```typescript
import * as Google from 'expo-auth-session/providers/google';

const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: GOOGLE_SCOPES,
  extraParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
});
```

### Supabase Auth Integration

For MVP, we can use Supabase's built-in Google OAuth provider OR manually exchange tokens. The simpler approach is using Supabase's signInWithOAuth, but this limits control over scopes.

**Recommended**: Use expo-auth-session for OAuth, then call `supabase.auth.signInWithIdToken()` with the Google ID token.

### File Structure

```
services/
├── supabase.ts              # Supabase client
└── auth/
    └── google-auth.ts       # Google OAuth hook

contexts/
└── AuthContext.tsx          # Auth state provider

hooks/
└── useAuth.ts               # Auth convenience hook
```

---

## 6. Success Metrics

- [ ] User can sign in with Google on device
- [ ] Session persists after closing and reopening app
- [ ] Unauthenticated access to feed is blocked
- [ ] Sign out works correctly
- [ ] Gmail scopes are granted (verified in Google OAuth response)

---

## 7. Open Questions

1. **Token storage for Gmail**: For MVP, store in Supabase user metadata? Or create oauth_tokens table now?
   - **Decision**: Store in user metadata for MVP. Migrate to encrypted table in PRD 03.

---

*Last updated: January 2026*
