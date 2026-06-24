#!/usr/bin/env bash
# PreToolUse guard for .env writes.
# - Asks for confirmation before editing any .env file (frontend/.env is committed
#   on purpose for localhost VITE_* — edits are rare and worth a second look).
# - Hard-denies when the new content looks like a real secret, so production
#   credentials never land in a tracked .env.
# Protocol: reads the tool-call JSON on stdin, emits a PreToolUse permission
# decision on stdout. See CLAUDE.md (frontend/.env is dev-only).
set -euo pipefail

input="$(cat)"
path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"
[ -z "$path" ] && exit 0

base="$(basename "$path")"
# Match .env and .env.<suffix>, but allow templates/examples.
case "$base" in
  .env|.env.*) ;;
  *) exit 0 ;;
esac
case "$base" in
  .env.example|.env.sample|.env.template) exit 0 ;;
esac

# Pull whatever text the tool wants to write (Write=content, Edit=new_string).
content="$(printf '%s' "$input" | jq -r '.tool_input.content // .tool_input.new_string // empty')"

emit() { # $1=decision $2=reason
  jq -nc --arg d "$1" --arg r "$2" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:$d,permissionDecisionReason:$r}}'
}

# Real-secret heuristics: private keys, long opaque tokens, non-localhost creds.
if printf '%s' "$content" | grep -qiE 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|(secret|client[_-]?secret|api[_-]?key|password|token)[[:space:]]*=[[:space:]]*[^[:space:]]{16,}|(sk-[a-zA-Z0-9]{16,})|(AKIA[0-9A-Z]{16})'; then
  # Allow obvious localhost/dev placeholders through to the "ask" tier instead.
  if ! printf '%s' "$content" | grep -qiE '=[[:space:]]*(localhost|127\.0\.0\.1|changeme|demo|admin|http://localhost)'; then
    emit deny "This looks like a real secret being written to $base. Keep production credentials out of tracked .env files — use an untracked file or a secrets manager, and commit only .env.example placeholders."
    exit 0
  fi
fi

emit ask "About to edit $base. frontend/.env is committed on purpose (localhost VITE_* only); confirm no real secret is going in."
exit 0
