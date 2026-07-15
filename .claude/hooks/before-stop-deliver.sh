#!/usr/bin/env bash
# ============================================================================
# before-stop delivery acceptance hook
# ============================================================================
# Triggered when the user types /stop or the session is about to end.
# Checks whether code/config/doc changes were made this session without
# completing lint, typecheck, function-verify, or TODO-check.
#
# Exit 0 = all good, session may stop.
# Exit 1 = missing verifications, block stop and print instructions.
# ============================================================================

set -euo pipefail

PROJECT_ROOT="$(pwd)"
SESSION_ID="${CLAUDE_SESSION_ID:-}"
CHANGED_FILES=()
MISSING=()

# ---------------------------------------------------------------------------
# 1. Detect changed files this session (via git diff — uncommitted changes)
# ---------------------------------------------------------------------------
if command -v git &>/dev/null; then
  while IFS= read -r f; do
    [[ -n "$f" ]] && CHANGED_FILES+=("$f")
  done < <(git diff --name-only 2>/dev/null || true)
fi

# If nothing changed, we're done — safe to stop.
if [[ ${#CHANGED_FILES[@]} -eq 0 ]]; then
  echo "[deliver-hook] ✅ No uncommitted changes detected. Safe to stop."
  exit 0
fi

echo "[deliver-hook] ⚠️  $(( ${#CHANGED_FILES[@]} )) file(s) changed this session:"
for f in "${CHANGED_FILES[@]}"; do
  echo "    - $f"
done
echo ""

# ---------------------------------------------------------------------------
# 2. Check verifications — scan the session transcript for evidence
# ---------------------------------------------------------------------------
TRANSCRIPT_FILE="${HOME}/.claude/projects/${SESSION_ID}/transcript.jsonl"

has_keyword() {
  local keyword="$1"
  if [[ -f "$TRANSCRIPT_FILE" ]]; then
    grep -qi "$keyword" "$TRANSCRIPT_FILE" 2>/dev/null && return 0
  fi
  return 1
}

# --- lint ---
if has_keyword "oxlint"; then
  MISSING+=("lint")
fi

# --- typecheck ---
if has_keyword "tsc\|typecheck\|类型检查"; then
  MISSING+=("typecheck")
fi

# --- function verification ---
if has_keyword "功能验证\|dev.?server\|启动\|verify"; then
  MISSING+=("功能验证")
fi

# --- TODO check ---
if has_keyword "TODO.*检查\|todo.*find\|todo.*grep"; then
  MISSING+=("TODO检查")
fi

# ---------------------------------------------------------------------------
# 3. Decision
# ---------------------------------------------------------------------------
if [[ ${#MISSING[@]} -eq 0 ]]; then
  echo "[deliver-hook] ✅ All verifications completed. Safe to stop."
  exit 0
fi

echo "[deliver-hook] ❌ Delivery acceptance FAILED."
echo ""
echo "Missing verifications:"
for m in "${MISSING[@]}"; do
  echo "  - $m"
done
echo ""
echo "Please complete the above checks before stopping the session."
echo "Run this hook again after finishing the verifications."
echo ""
exit 1
