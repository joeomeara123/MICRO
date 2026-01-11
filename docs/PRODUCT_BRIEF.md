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

## Core Concept: Interaction Complexity Matching

**Match the interaction to the task complexity.**

### Two Interaction Patterns

| Pattern | When to Use | Example Tasks |
|---------|-------------|---------------|
| **Swipe** | Binary decisions (yes/no) | Approve contract, dismiss notification, mark done |
| **Tap → Expand → AI Assist** | Needs thought or composition | Reply to email, respond to Slack, review candidate |

### Swipe Tasks (Binary)

Simple yes/no decisions that don't require reading or composing:

| Task Type | Source | Swipe Right | Swipe Left |
|-----------|--------|-------------|------------|
| **Finance Reminder** | Notion | Mark done | Snooze |
| **Approval Request** | Notion | Approve | Reject |
| **Content Card** | X/Twitter | Save for later | Skip |

### Expand Tasks (AI-Assisted)

Tasks requiring context, thought, or composition:

```
┌─────────────────────────────┐
│  📧 Email from Sarah        │  ← Card in stack (minimal)
│  "Q3 Budget Review"         │
└─────────────────────────────┘
            │ TAP
            ▼
┌─────────────────────────────────────────────┐
│  📧 Email from Sarah                        │
│  ─────────────────────────────────          │
│  "Hi Joe, can you review the Q3 budget      │
│   and let me know your thoughts on the      │
│   marketing allocation? Thanks!"            │
│  ─────────────────────────────────          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 💬 "Want me to draft a reply?"      │   │
│  │                                      │   │
│  │  [Yes, draft it]  [I'll type myself] │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
            │ "Yes, draft it"
            ▼
┌─────────────────────────────────────────────┐
│  📧 Reply to Sarah                          │
│  ─────────────────────────────────          │
│  "Hi Sarah,                                 │
│                                             │
│   I've reviewed the Q3 budget. The          │
│   marketing allocation looks good overall,  │
│   though we might want to shift 5% from     │
│   paid ads to content..."                   │
│                                             │
│  [Edit]                    [Send ✓]         │
└─────────────────────────────────────────────┘
```

### Expand Task Examples

| Task Type | Source | Tap Action | AI Prompt | Final Actions |
|-----------|--------|------------|-----------|---------------|
| **Email Reply** | Gmail | Show full email | "Want me to draft a reply?" | Edit / Send |
| **Slack Message** | Slack | Show thread context | "Want me to draft a response?" | Edit / Send |
| **Candidate Review** | Notion | Show CV summary | "Schedule interview?" | Pick time / Reject |
| **Document Review** | Notion | Show document | "Summarize key points?" | Approve / Request changes |

### Card States

Cards progress through states based on interaction:

```
INITIAL (in stack)           EXPANDED (tapped)              AI ASSIST                    ACTION
┌──────────────┐            ┌──────────────────┐          ┌──────────────────┐         ┌──────────────┐
│ Title        │  ──TAP──▶  │ Full content     │  ──AI──▶ │ AI draft shown   │  ──OK──▶│ Send/Confirm │
│ Source icon  │            │ Context          │          │ Edit option      │         │              │
│ Priority     │            │ AI prompt button │          │ Confirm/reject   │         │              │
└──────────────┘            └──────────────────┘          └──────────────────┘         └──────────────┘
       │                                                                                      │
       └──────────────────────────SWIPE (binary tasks only)───────────────────────────────────┘
```

**Key Principle**: User always stays in control. AI offers to help, never auto-sends.

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

## Authentication & Integrations

**See full details**: `docs/INTEGRATION_ARCHITECTURE.md`

### How Users Connect

```
1. SIGN IN WITH GOOGLE
   └── Creates account + grants Gmail access in one step
       (Single OAuth with extended scopes)

2. SETTINGS → CONNECTED APPS
   ┌─────────────────────────────────────────────┐
   │  ✅ Google (Gmail)     joe@palindrom.ai     │
   │  ⬜ Notion              [Connect]            │
   │  ⬜ Slack               [Connect]            │
   └─────────────────────────────────────────────┘

3. TAP TO CONNECT EACH SERVICE
   └── Opens OAuth in browser → User authorizes → Token stored
```

### Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Integration approach | Build each OAuth directly | Full control, no third-party dependency |
| Gmail access | Included with Google Sign-In | One sign-in flow, better UX |
| Token storage | Encrypted in Supabase | Tokens never touch mobile app |
| API calls | Proxied via Edge Functions | Security + automatic token refresh |

### Security Model

```
Mobile App ───"fetch emails"───▶ Supabase Edge Function
                                      │
                                      ├── Get encrypted token
                                      ├── Decrypt token
                                      ├── Call Gmail API
                                      └── Return data (not token)
                                           │
Mobile App ◀───"here are emails"──────────┘
```

**Tokens never leave the server** - even if app is reverse-engineered, tokens are safe.

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
- [ ] Gmail integration (read emails, send AI-drafted replies)
- [ ] Slack integration (read messages, send AI-drafted responses)
- [ ] AI-drafted responses (Claude/OpenAI for email/Slack)
- [ ] Task cards with priority badges
- [ ] Expanded card view with AI assist prompts
- [ ] Learning mode with manual content add
- [ ] Haptic feedback
- [ ] Animated splash screen

### Out of Scope (Phase 1)
- Push notifications (Phase 2)
- Calendar integration (Phase 2)
- Offline mode (Phase 3)
- App Store submission (Phase 3)

---

## PRD Breakdown

The MVP will be built through these PRDs (in priority order):

| # | PRD | Description | Dependencies |
|---|-----|-------------|--------------|
| 01 | Core Swipe | Gesture handling, animations, haptics | None |
| 02 | Authentication | Google Sign-In + Supabase session | None |
| 03 | Task Data Model | Supabase schema + polymorphic types | 02 |
| 04 | Notion Sync | Pull tasks, update status | 02, 03 |
| 05 | Card UI System | Swipe cards + Expanded view + AI assist UI | 01, 03 |
| 06 | Gmail Integration | Read emails, AI drafts, send replies | 02, 05 |
| 07 | Slack Integration | Read messages, AI drafts, send responses | 02, 05 |
| 08 | AI Drafting | Claude/OpenAI integration for responses | 06, 07 |
| 09 | Learning Mode | Content cards + mode toggle | 05 |
| 10 | Polish | Splash, transitions, refinements | All |

---

## Open Questions

1. ~~**Email integration approach**: Gmail API vs IMAP vs third-party?~~ → **Gmail API** (via Google OAuth)
2. **AI provider for drafts**: OpenAI vs Claude vs local model?
3. ~~**Slack app vs OAuth**: Build Slack app or use OAuth?~~ → **OAuth** (user-level access)
4. **Content curation**: Manual add vs AI recommendations vs RSS?

---

## References

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Notion API](https://developers.notion.com/)

---

*This Product Brief guides all PRDs. Update as decisions are made.*
