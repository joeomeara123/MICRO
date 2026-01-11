# CLAUDE.md - Micro App

This file provides context for Claude Code when working on this project.

## Project Overview

**Micro** is a swipe-based iOS app for Palindrom that replaces doom scrolling with productive micro-tasks. Users swipe through tasks (like Tinder) to complete actions - reviewing candidates, approving contracts, responding to emails, etc.

**Vision**: Two modes:
1. **Tasks Mode** - Actionable micro-tasks from Notion, email, AI suggestions
2. **Learning Mode** - Curated content from X/Twitter, team Slack links

**Full Product Brief**: See `docs/PRODUCT_BRIEF.md`

---

## Development Methodology: Ralph Workflow

We use the **Ralph Wiggum approach** for structured, testable development:

```
Product Brief → PRDs → User Stories → Success Criteria → Build → Test → Merge
```

### Key Files
| File | Purpose |
|------|---------|
| `docs/PRODUCT_BRIEF.md` | Overall product vision and scope |
| `docs/prd/*.md` | Individual PRDs with user stories |
| `docs/prd/*.json` | PRDs converted to executable format |
| `progress.txt` | Append-only log of learnings |
| `CLAUDE.md` | This file - patterns and context |

### PRD Execution Rules
1. **Atomic stories** - Each must fit in one context window
2. **Dependency order** - Schema → Backend → UI
3. **Verifiable criteria** - No vague "works correctly"
4. **Typecheck always** - Every story ends with "Typecheck passes"
5. **Device verify** - UI changes require "Verify on device via Expo Go"

---

## Current Phase

**Phase 1: MVP** - Core task swiping with integrations

### PRD Backlog
| # | PRD | Status | Description |
|---|-----|--------|-------------|
| 01 | Core Swipe | ✅ Done | Gesture handling, animations, haptics |
| 02 | Authentication | 🔲 Next | Google Sign-In + Supabase session |
| 03 | Task Data Model | 🔲 Pending | Supabase schema + types |
| 04 | Notion Sync | 🔲 Pending | Pull tasks, update status |
| 05 | Task Cards | 🔲 Pending | Polymorphic card UI + actions |
| 06 | Learning Mode | 🔲 Pending | Content cards + mode toggle |
| 07 | Polish | 🔲 Pending | Splash, transitions, refinements |

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
- [x] Product Brief created
- [x] Ralph workflow established

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
├── docs/                         # Ralph workflow documents
│   ├── PRODUCT_BRIEF.md          # Overall product vision
│   └── prd/                      # PRDs (markdown + JSON)
│       ├── 01-core-swipe.md
│       ├── 02-authentication.md
│       └── ...
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
├── progress.txt                  # Append-only learnings log
└── CLAUDE.md                     # This file
```

## Key Decisions Made

1. **Expo over native Swift** - Faster iteration, vibe coding friendly, can test on device via Expo Go
2. **Supabase over Firebase** - PostgreSQL, better DX, open source
3. **Google Sign-In** - User preference, good Gmail integration later
4. **Polymorphic task cards** - Each task type defines its own swipe actions (not binary approve/dismiss)
5. **Card states** - Initial → Expanded (tap) → Action (swipe)
6. **Learning Mode in MVP** - Curated content alongside tasks from day one
7. **All integrations MVP** - Notion + Email + Slack (not incremental)
8. **TypeScript + ESLint for QA** - No complex test setup for MVP, fast iteration
9. **Ralph workflow** - PRD-driven development with testable success criteria

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
