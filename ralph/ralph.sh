#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop (Claude Code version)
# Usage: ./ralph.sh [max_iterations]
#
# Adapted from https://github.com/snarktank/ralph for Claude Code CLI

set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}Ralph Wiggum${NC} - Autonomous AI Agent Loop                   ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  Claude Code Edition                                        ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for required files
if [ ! -f "$PRD_FILE" ]; then
  echo -e "${RED}Error: prd.json not found at $PRD_FILE${NC}"
  echo "Create or copy your PRD file first."
  exit 1
fi

if [ ! -f "$SCRIPT_DIR/prompt.md" ]; then
  echo -e "${RED}Error: prompt.md not found at $SCRIPT_DIR/prompt.md${NC}"
  exit 1
fi

# Archive previous run if branch changed
if [ -f "$PRD_FILE" ] && [ -f "$LAST_BRANCH_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")

  if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
    # Archive the previous run
    DATE=$(date +%Y-%m-%d)
    # Strip "ralph/" prefix from branch name for folder
    FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

    echo -e "${YELLOW}Archiving previous run: $LAST_BRANCH${NC}"
    mkdir -p "$ARCHIVE_FOLDER"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
    echo -e "   ${GREEN}Archived to: $ARCHIVE_FOLDER${NC}"

    # Reset progress file for new run
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "Started: $(date)" >> "$PROGRESS_FILE"
    echo "Branch: $CURRENT_BRANCH" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
  fi
fi

# Track current branch
if [ -f "$PRD_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  if [ -n "$CURRENT_BRANCH" ]; then
    echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
  fi
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "unknown")
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "Branch: $CURRENT_BRANCH" >> "$PROGRESS_FILE"
  echo "" >> "$PROGRESS_FILE"
  echo "## Codebase Patterns" >> "$PROGRESS_FILE"
  echo "(Add reusable patterns discovered during development)" >> "$PROGRESS_FILE"
  echo "" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

# Show current PRD info
PRD_DESC=$(jq -r '.description // "No description"' "$PRD_FILE" 2>/dev/null)
TOTAL_STORIES=$(jq '.userStories | length' "$PRD_FILE" 2>/dev/null)
COMPLETE_STORIES=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE" 2>/dev/null)

echo -e "PRD: ${GREEN}$PRD_DESC${NC}"
echo -e "Progress: ${BLUE}$COMPLETE_STORIES / $TOTAL_STORIES${NC} stories complete"
echo -e "Max iterations: ${YELLOW}$MAX_ITERATIONS${NC}"
echo ""

# Check if already complete
if [ "$COMPLETE_STORIES" -eq "$TOTAL_STORIES" ] && [ "$TOTAL_STORIES" -gt 0 ]; then
  echo -e "${GREEN}All stories already complete!${NC}"
  exit 0
fi

echo -e "${BLUE}Starting Ralph loop...${NC}"
echo ""

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "  ${GREEN}Ralph Iteration $i of $MAX_ITERATIONS${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

  # Show remaining stories
  REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE" 2>/dev/null)
  echo -e "  Remaining stories: ${YELLOW}$REMAINING${NC}"
  echo ""

  # Run Claude Code with the ralph prompt
  # Using --dangerously-skip-permissions for autonomous operation
  # Using --print for non-interactive mode
  cd "$PROJECT_DIR"
  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" | claude -p --dangerously-skip-permissions 2>&1 | tee /dev/stderr) || true

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Ralph completed all tasks!                                 ║${NC}"
    echo -e "${GREEN}║  Completed at iteration $i of $MAX_ITERATIONS                              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
  fi

  echo ""
  echo -e "${BLUE}Iteration $i complete. Continuing in 2 seconds...${NC}"
  sleep 2
done

echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  Ralph reached max iterations ($MAX_ITERATIONS) without completing     ║${NC}"
echo -e "${YELLOW}║  Check progress.txt for status                              ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
exit 1
