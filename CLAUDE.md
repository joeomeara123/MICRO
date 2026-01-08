# CLAUDE.md - Micro App

This file provides context for Claude Code when working on this project.

## Project Overview

**Micro** is a swipe-based iOS app for Palindrom that replaces doom scrolling with productive micro-tasks. Users swipe through tasks (like Tinder) to complete actions - reviewing candidates, approving contracts, responding to emails, etc.

**Vision**: Two modes:
1. **Tasks Mode** - Actionable micro-tasks from Notion, email, AI suggestions
2. **Learning Mode** (Phase 3) - Curated content from X/Twitter, team Slack links

## Current Phase

**Phase 1: MVP** - Core task swiping with Notion integration

### Completed
- [x] Project planning and architecture design
- [x] Repository setup
- [x] Expo project initialization
- [x] Core dependencies installed (gesture handler, reanimated, Lottie, haptics, Supabase)
- [x] SwipeableCard component with gesture handler
- [x] TaskCard component with priority badges
- [x] CardStack component managing card stack
- [x] Task feed UI with sample data
- [x] TypeScript compiling successfully

### Next Up
- [ ] Test on device via Expo Go
- [ ] Google Sign-In authentication
- [ ] Supabase backend setup
- [ ] Notion integration
- [ ] Animated splash screen with Lottie

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 52+ (React Native) |
| Language | TypeScript |
| Animations | react-native-reanimated, Lottie |
| Gestures | react-native-gesture-handler |
| Backend | Supabase (PostgreSQL + Auth) |
| Auth | Google Sign-In via expo-auth-session |
| Task Source | Notion API |

## Project Structure

```
micro-app/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout with auth check
│   ├── index.tsx                 # Entry → redirects to auth or feed
│   ├── (auth)/
│   │   └── sign-in.tsx           # Google Sign-In screen
│   ├── (app)/
│   │   ├── feed.tsx              # Task feed (card stack)
│   │   ├── task/[id].tsx         # Task detail
│   │   └── settings.tsx          # Settings
├── components/
│   ├── SwipeableCard.tsx         # Core swipe component
│   ├── TaskCard.tsx              # Task card UI
│   └── CardStack.tsx             # Stack of cards
├── services/
│   ├── supabase.ts               # Supabase client
│   ├── notion.ts                 # Notion API
│   └── notifications.ts          # Push notifications
├── hooks/
│   ├── useAuth.ts                # Auth state
│   └── useTasks.ts               # Tasks data
├── types/
│   └── index.ts                  # TypeScript types
└── CLAUDE.md                     # This file
```

## Key Decisions Made

1. **Expo over native Swift** - Faster iteration, vibe coding friendly, can test on device via Expo Go
2. **Supabase over Firebase** - PostgreSQL, better DX, open source
3. **Google Sign-In** - User preference, good Gmail integration later
4. **Binary swipes for MVP** - Right = approve, Left = dismiss. Multi-action swipes in Phase 2
5. **Minimal card UI** - Title + source icon + priority. Details on tap.
6. **TypeScript + ESLint for QA** - No complex test setup for MVP, fast iteration

## Notion Database Fields (User's Existing)

The user has a Notion database with these fields:
- Category
- Status
- Priority Level
- Owner / Owner email
- Due Date / Due day of Month
- Description / Notes
- Snooze Count
- Rule (automation)
- slack id

## Development Workflow

```bash
# Start dev server
npx expo start

# Scan QR with Expo Go app on iPhone (same WiFi)
# Changes hot-reload instantly

# Type check before committing
npm run check
```

## External Services to Configure

1. **Supabase** - https://supabase.com (create project, get URL + anon key)
2. **Google Cloud Console** - OAuth credentials for sign-in
3. **Notion Developer Portal** - Integration for task sync

## Animation Requirements (Demo Polish)

- Lottie animated logo on splash (like Polymarket)
- Smooth splash → app transition
- Card stack with depth effect
- Swipe reveals action indicator (green check / red X)
- Haptic feedback on threshold crossing
- Spring physics for animations

## Links

- **GitHub**: https://github.com/joeomeara123/MICRO
- **Plan File**: ~/.claude/plans/lexical-sleeping-sutton.md
- **Expo Docs**: https://docs.expo.dev/
- **Gesture Handler**: https://docs.swmansion.com/react-native-gesture-handler/

## Commands Reference

```bash
# Install dependencies
npx expo install [package]

# Run type check
npx tsc --noEmit

# Run linter
npx eslint . --ext .ts,.tsx

# Build for App Store (later)
eas build --platform ios
```

---

*Last updated: January 2026 - Phase 1 MVP in progress*
