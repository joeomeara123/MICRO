# Ralph - Autonomous AI Agent Loop

Ralph automates PRD implementation by running Claude Code in a loop, one user story at a time.

## Quick Start

```bash
# Run Ralph (default 10 iterations)
./ralph.sh

# Run with custom iteration limit
./ralph.sh 20
```

## How It Works

1. **Read PRD**: Ralph reads `prd.json` to find the next incomplete story
2. **Implement**: Claude Code implements ONE user story per iteration
3. **Quality Check**: Runs `npx tsc --noEmit` before committing
4. **Commit**: Commits with `feat: [Story ID] - [Story Title]`
5. **Update**: Marks story as `passes: true` in prd.json
6. **Log**: Appends progress to progress.txt
7. **Repeat**: Continues until all stories complete

## Files

| File | Purpose |
|------|---------|
| `ralph.sh` | Main automation script |
| `prompt.md` | Instructions given to each Claude iteration |
| `prd.json` | Current PRD with user stories (copy from docs/prd/) |
| `progress.txt` | Append-only progress log |
| `archive/` | Previous run archives |

## Workflow

```
1. Create PRD       → docs/prd/XX-name.md (using PRD skill)
2. Convert to JSON  → docs/prd/XX-name.json
3. Copy to ralph    → cp docs/prd/XX-name.json ralph/prd.json
4. Run Ralph        → cd ralph && ./ralph.sh
```

## Stop Condition

Ralph stops when:
- All stories have `passes: true`, OR
- Max iterations reached (default 10)

Claude signals completion with: `<promise>COMPLETE</promise>`

## Progress Log

The `progress.txt` file is append-only. Each story adds:

```
## [Date] - US-001: Story Title
- What was implemented
- Files changed
- Learnings for future iterations
---
```

## Codebase Patterns

The top of `progress.txt` has a "Codebase Patterns" section for reusable learnings that help future iterations.

## Troubleshooting

**Ralph exits without completing:**
- Check `progress.txt` for errors
- Increase max iterations: `./ralph.sh 30`
- Check if typecheck is failing: `npx tsc --noEmit`

**Stories not being marked complete:**
- Verify `ralph/prd.json` is being updated
- Check commit messages match format: `feat: [Story ID] - [Story Title]`

---

*Adapted from [snarktank/ralph](https://github.com/snarktank/ralph) for Claude Code*
