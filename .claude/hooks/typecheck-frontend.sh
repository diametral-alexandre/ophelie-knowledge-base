#!/usr/bin/env bash
# PostToolUse type-check for frontend edits.
# After editing a frontend .ts/.tsx file, run `tsc --noEmit` so type breaks
# surface immediately (the only other gate is build time). On errors, exit 2 to
# feed the diagnostics back to Claude; otherwise stay silent.
# Protocol: reads the tool-call JSON on stdin.
set -uo pipefail

input="$(cat)"
path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"
[ -z "$path" ] && exit 0

case "$path" in
  *frontend/*.ts|*frontend/*.tsx) ;;
  *) exit 0 ;;
esac

dir="${CLAUDE_PROJECT_DIR:-.}/frontend"
[ -d "$dir/node_modules" ] || exit 0   # deps not installed (e.g. dockerized) — skip quietly

out="$(cd "$dir" && npx --no-install tsc -p tsconfig.json --noEmit --pretty false 2>&1)"
status=$?
if [ $status -ne 0 ]; then
  echo "tsc --noEmit found type errors after editing $(basename "$path"):" >&2
  printf '%s\n' "$out" >&2
  exit 2
fi
exit 0
