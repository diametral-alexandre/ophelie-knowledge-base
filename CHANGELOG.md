# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project does not yet
use semantic version tags (pre-1.0, hackathon stage).

## [Unreleased]

### Added

- Claude Code automation setup (via `/devkit:init-claude-setup`):
  - Per-folder context guides: `frontend/CLAUDE.md`, `backend/CLAUDE.md`,
    `keycloak/CLAUDE.md`.
  - Hooks in `.claude/settings.json`: PostToolUse `tsc --noEmit` type-check on
    frontend edits, and a PreToolUse guard that asks before `.env` writes and
    denies real-looking secrets.
  - `.mcp.json` pinning the `context7` (live docs) and `playwright` (E2E/login)
    MCP servers for the project.
  - `/scaffold-page` skill that scaffolds a page (+ optional detail page) and
    wires `ROUTES`/`NAV`/`<Route>` in `src/App.tsx`.
  - `.pre-commit-config.yaml` and `backend/ruff.toml`, with two stages:
    pre-commit (fast, changed files — ruff lint+format, `tsc --noEmit`, hygiene)
    and pre-push (whole tree — full `tsc -b` project type-check and full-tree
    ruff lint).
  - Code-review routing to `ecc:security-reviewer` (auth) and
    `ecc:fastapi-reviewer` (backend), documented in `CLAUDE.md`.

### Changed

- Reframed `README.md` and the root `CLAUDE.md` from the generic "hackathon
  whiteapp" to the **Ophélie knowledge base**, documenting the client-owned
  `frontend/src/data/` Library seed and noting the backend is still the starter's
  generic `Item` API.

## [0.1.0] — Starter

- Initial hackathon whiteapp: React + Diametral frontend, FastAPI backend,
  Keycloak auth (Authorization Code + PKCE, JWKS validation), two Postgres DBs,
  one-command `docker compose up`.
- Frontend evolved into the Ophélie knowledge base MVP (Consultants, References,
  Clients, Offers screens) with a frontend-owned seed in `src/data/`.
