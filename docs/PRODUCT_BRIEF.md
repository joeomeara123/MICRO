# Micro - Product Brief

> **Version**: 1.0
> **Last Updated**: January 2026
> **Status**: MVP Planning

---

## Vision

**Replace doom scrolling with productive micro-actions.**

Micro is a swipe-based iOS app that transforms idle phone time into productive task completion. Instead of mindlessly scrolling social media, users swipe through actionable work items — approving contracts, triaging emails, reviewing candidates, catching up on curated content.

Same dopamine hit. Actually getting things done.

---

## Target Users

| Segment | Description |
|---------|-------------|
| **Primary** | Palindrom team (internal tool) |
| **Secondary** | Palindrom clients (capability demo) |
| **Future** | General productivity enthusiasts (App Store) |

---

## Success Metrics

### MVP Success (Personal Daily Usage)
- [ ] Founder uses Micro daily instead of Twitter/Reddit
- [ ] Processes 10+ tasks per day via swipe
- [ ] Feels faster than opening Notion/email directly

### Team Success (Phase 2)
- [ ] 3+ team members actively using weekly
- [ ] Tasks completed faster than traditional methods
- [ ] Positive feedback on swipe UX

---

## Core Concept: Polymorphic Task Cards

Tasks are **context-dependent**. Each task type defines its own swipe actions and card UI.

### Task Type Examples

| Task Type | Source | Swipe Right | Swipe Left | Card Content |
|-----------|--------|-------------|------------|--------------|
| **Finance Reminder** | Notion | Mark done | Snooze | "Upload VAT by Friday" |
| **Email Draft** | Gmail | Send drafted reply | Archive | Subject + AI-drafted reply |
| **Candidate Review** | Notion/ATS | Schedule interview | Reject | Name + CV summary |
| **Slack Link** | Slack | Save/bookmark | Dismiss | Link preview + context |
| **Content** | X/Twitter | Save to read later | Skip | Tweet/thread preview |

### Card States

Cards can have **intermediate states** before final action:
1. **Initial** → View summary
2. **Expanded** → Tap for details (CV, email thread, full article)
3. **Action** → Swipe to execute

---

## Two Modes

### 1. Tasks Mode (Primary)
Actionable items requiring decisions:
- Notion tasks (filtered by priority/due date)
- Email triage (AI-drafted responses)
- Hiring pipeline (candidate reviews)
- Finance reminders
- Slack action items

### 2. Learning Mode
Curated content for productive consumption:
- Saved X/Twitter threads (via Slack links or direct)
- Team-shared articles
- Industry news digest
- "Read later" queue

Toggle between modes via bottom tab or swipe gesture.

---

## Integrations (MVP)

| Service | Purpose | Priority |
|---------|---------|----------|
| **Notion** | Task source, status updates | P0 |
| **Gmail** | Email triage, send responses | P0 |
| **Slack** | Links, messages, context | P0 |
| **Supabase** | Auth, data sync, queue | P0 |

### Future Integrations
- Calendar (meeting prep cards)
- Linear/GitHub (issue triage)
- Twitter/X API (direct content pull)
- AI providers (draft generation)

---

## Authentication

**Google Sign-In Only** (MVP)
- Simple OAuth flow
- Ties directly to Gmail for email integration
- Familiar to users
- Supabase handles session management

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Micro iOS App                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   SwipeUI   │  │  CardStack  │  │   Haptics   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Supabase                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Auth     │  │  PostgreSQL │  │  Edge Funcs │     │
│  │  (Google)   │  │  (Tasks DB) │  │  (Sync)     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐    ┌──────────┐    ┌──────────┐
     │  Notion  │    │  Gmail   │    │  Slack   │
     │   API    │    │   API    │    │   API    │
     └──────────┘    └──────────┘    └──────────┘
```

---

## UX Requirements

### Animation & Polish (Polished Level)
- **Swipe physics**: Spring animations, natural momentum
- **Haptic feedback**: Subtle tap on threshold, stronger on action
- **Card depth**: Stacked cards with parallax effect
- **Transitions**: Smooth card exit/enter animations
- **Splash**: Animated Lottie logo (Polymarket-inspired)

### Gesture Vocabulary
| Gesture | Action |
|---------|--------|
| Swipe Right (>50%) | Primary action (approve/send/save) |
| Swipe Left (>50%) | Secondary action (dismiss/reject/skip) |
| Tap | Expand card details |
| Long press | Quick actions menu |
| Pull down | Refresh feed |

---

## MVP Scope

### In Scope (Phase 1)
- [x] Core swipe UI with animations
- [ ] Google Sign-In authentication
- [ ] Notion task sync (read + update status)
- [ ] Task cards with priority badges
- [ ] Learning mode with manual content add
- [ ] Haptic feedback
- [ ] Animated splash screen

### Out of Scope (Phase 1)
- Email integration (Phase 2)
- Slack integration (Phase 2)
- AI-drafted responses (Phase 2)
- Push notifications (Phase 2)
- Offline mode (Phase 3)
- App Store submission (Phase 3)

---

## PRD Breakdown

The MVP will be built through these PRDs (in priority order):

| # | PRD | Description | Dependencies |
|---|-----|-------------|--------------|
| 01 | Core Swipe | Gesture handling, animations, haptics | None |
| 02 | Authentication | Google Sign-In + Supabase session | None |
| 03 | Task Data Model | Supabase schema + types | 02 |
| 04 | Notion Sync | Pull tasks, update status | 02, 03 |
| 05 | Task Cards | Polymorphic card UI + actions | 01, 03 |
| 06 | Learning Mode | Content cards + mode toggle | 01, 05 |
| 07 | Polish | Splash, transitions, refinements | All |

---

## Open Questions

1. **Email integration approach**: Gmail API vs IMAP vs third-party (Nylas)?
2. **AI provider for drafts**: OpenAI vs Claude vs local model?
3. **Slack app vs OAuth**: Build Slack app or use OAuth for link access?
4. **Content curation**: Manual add vs AI recommendations vs RSS?

---

## References

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Notion API](https://developers.notion.com/)

---

*This Product Brief guides all PRDs. Update as decisions are made.*
