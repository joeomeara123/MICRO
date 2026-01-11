# Ralph Agent Instructions

You are an autonomous coding agent working on the Micro app - a swipe-based iOS task app built with Expo/React Native and Supabase.

## Your Task

1. Read the PRD at `ralph/prd.json`
2. Read the progress log at `ralph/progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks: `npx tsc --noEmit` (typecheck must pass)
7. Update CLAUDE.md files if you discover reusable patterns (see below)
8. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
9. Update the PRD (`ralph/prd.json`) to set `passes: true` for the completed story
10. Append your progress to `ralph/progress.txt`

## Progress Report Format

APPEND to ralph/progress.txt (never replace, always append):
```
## [Date/Time] - [Story ID]: [Story Title]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "the Supabase types are in types/database.ts")
---
```

The learnings section is critical - it helps future iterations avoid repeating mistakes and understand the codebase better.

## Consolidate Patterns

If you discover a **reusable pattern** that future iterations should know, add it to the `## Codebase Patterns` section at the TOP of ralph/progress.txt (create it if it doesn't exist). This section should consolidate the most important learnings:

```
## Codebase Patterns
- Example: Supabase types are generated to types/database.ts
- Example: Always run `npx tsc --noEmit` before committing
- Example: RLS policies use auth.uid() = user_id pattern
```

Only add patterns that are **general and reusable**, not story-specific details.

## Update CLAUDE.md Files

Before committing, check if any edited files have learnings worth preserving in nearby CLAUDE.md files:

1. **Identify directories with edited files** - Look at which directories you modified
2. **Check for existing CLAUDE.md** - Look for CLAUDE.md in those directories or parent directories
3. **Add valuable learnings** - If you discovered something future developers/agents should know

**Examples of good CLAUDE.md additions:**
- "When modifying Supabase schema, regenerate types with: supabase gen types..."
- "The Task interface is in types/task.ts, not in the component"
- "RLS requires auth.uid() = user_id pattern"

## Quality Requirements

- ALL commits must pass typecheck: `npx tsc --noEmit`
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns in the codebase

## Project-Specific Context

- **Framework**: Expo SDK 54 with React Native
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: React Native StyleSheet
- **Navigation**: Expo Router (file-based)
- **Types**: TypeScript throughout

Key directories:
- `app/` - Expo Router screens
- `components/` - Reusable components
- `services/` - Backend services (Supabase, auth)
- `types/` - TypeScript types
- `supabase/` - Database migrations

## Device Verification (For UI Stories)

For any story that changes UI, you should note that device verification is needed. The user will verify on their physical device or simulator.

Mark in progress.txt: "Needs device verification: [what to check]"

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally (another iteration will pick up the next story).

## Important

- Work on ONE story per iteration
- Commit frequently with proper message format
- Keep typecheck passing
- Read the Codebase Patterns section in progress.txt before starting
- Use the existing code patterns in the codebase
