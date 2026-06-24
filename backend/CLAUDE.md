# backend/CLAUDE.md

Local guide for the FastAPI backend. See the root `CLAUDE.md` for the
cross-cutting map (auth flow, run commands, the internal/public URL split).

## Status: still the starter API

The backend is **the hackathon whiteapp's generic `Item` API** — it has **not**
been ported to the Ophélie consulting domain. The Library (consultants,
references, clients) currently lives entirely in the frontend seed
(`frontend/src/data/`). When you add real persistence, port the model from
`frontend/src/data/types.ts` rather than inventing a parallel schema.

## Layout (`app/`)

- `main.py` — app factory: CORS from `settings.cors_origin_list`, router includes,
  and a `lifespan` that runs `Base.metadata.create_all` on startup (no Alembic).
- **`auth.py`** — the core, and the security-sensitive file. `get_current_user`
  validates the Keycloak JWT against the realm JWKS (**signature + issuer + expiry
  + audience**). `require_role("admin")` gates by realm role. Review changes here
  with the `security-reviewer` agent.
- `config.py` — `pydantic-settings`; all env-driven config (Keycloak URLs,
  audience, CORS, DB).
- `database.py` — SQLAlchemy 2 engine + session.
- `models.py` / `schemas.py` — SQLAlchemy tables / Pydantic I/O models.
- `routers/{me,items}.py` — `APIRouter`s.

## Auth invariant — do not "simplify"

The backend fetches JWKS from `KEYCLOAK_INTERNAL_URL` (`http://keycloak:8080`,
compose network) but validates the token's `iss` against `KEYCLOAK_ISSUER_URL`
(`http://localhost:8080`, the browser's host). They are intentionally different;
unifying them breaks validation. `aud` must be `KEYCLOAK_AUDIENCE`
(`hackathon-api`; set `""` to disable).

## Add an API route

Create `app/routers/foo.py` (an `APIRouter`), `include_router` it in `main.py`,
and protect it with `user: CurrentUser = Depends(get_current_user)` (add
`Depends(require_role("admin"))` for admin-only). Define request/response shapes
in `schemas.py`.

## Model change

Edit `app/models.py`. Tables are `create_all`'d on startup, so a schema change
only applies on a **fresh** DB — `make clean` to recreate app-db. Introduce
Alembic before the schema matters.

## Conventions

- Python is linted + formatted by **ruff** via pre-commit. Run `ruff check` /
  `ruff format` (or just commit — the hook runs them).
- Deps are pinned in `requirements.txt`. Run locally with
  `uvicorn app.main:app --reload` against a reachable Postgres + Keycloak.
- Reviewers (local, in `.claude/agents/`): `fastapi-reviewer` for general changes,
  `security-reviewer` for anything touching `auth.py`.
