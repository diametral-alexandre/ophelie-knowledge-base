# CLAUDE.md

Working guide for Claude Code in this repo. `README.md` is the user-facing tour;
this file is the dense, actionable version. Keep it accurate when things change.

## What this is

The **Ophélie knowledge base** — a consulting-firm Library (consultants,
references/missions, clients, offers) built on a hackathon "whiteapp" starter: a
**React + Diametral design system** frontend, a **FastAPI** backend, **Keycloak**
auth, and **two Postgres** DBs — everything comes up with one
`docker compose up`. Keycloak's login/emails are themed with Diametral too.

**Where the product actually lives today:** the frontend is the Ophélie product
and owns its data **client-side** — the Library is seeded in `frontend/src/data/`
(no backend behind it yet, see `data/types.ts`). The **backend is still the
starter's generic `Item` API**; it has not been ported to the consulting domain.
When wiring real persistence, the domain model in `src/data/types.ts`
(`Consultant`, `Reference`, `Client`) is the source of truth to port backward.

Sub-area guides (nested `CLAUDE.md`): [`frontend/CLAUDE.md`](frontend/CLAUDE.md),
[`backend/CLAUDE.md`](backend/CLAUDE.md), [`keycloak/CLAUDE.md`](keycloak/CLAUDE.md).

## Run & iterate

- `make up` (= `docker compose up --build`) — start everything. First boot is
  ~1–2 min while Keycloak imports the realm.
- `make down` — stop (keeps data). `make clean` — stop **and wipe DB volumes**
  (required to re-import the realm after editing `keycloak/realm-export.json`).
- `make logs` or `docker compose logs -f <service>` — logs.
- Ports: frontend `:5173`, backend `:8000` (`/docs` = Swagger), Keycloak `:8080`
  (admin console `admin`/`admin`), app-db `:5432`.
- Seeded users: `demo`/`demo` (role `user`), `admin`/`admin` (roles `user,admin`).
- Hot reload: the frontend (Vite HMR) and backend (uvicorn `--reload`) bind-mount
  their source; the Keycloak theme is bind-mounted with caching off (edit + reload
  the login page). No rebuild needed for source edits.

## Layout

- `frontend/` — Vite + React + TS. `src/main.tsx` (Keycloak init gate → render),
  `src/App.tsx` (`ConsoleLayout` shell + `ROUTES`/`NAV` + routes), `src/pages/`
  (Consultants, References, Clients, Offers + their `*Detail` pages, Settings,
  Profile), `src/lib/` (`keycloak.ts`, `api.ts` = token-injecting fetch,
  `config.ts`, `currentUser.ts`, `resourceUi.tsx`, `types.ts`), and **`src/data/`**
  — the **client-owned Library seed** (`consultants.ts`, `references.ts`,
  `types.ts`); the MVP's only source of truth. See `frontend/CLAUDE.md`.
- `backend/` — FastAPI. `app/main.py` (app factory, CORS, `create_all`),
  **`app/auth.py`** (Keycloak JWT validation — the core), `app/config.py`
  (pydantic-settings), `app/database.py`, `app/models.py`, `app/schemas.py`,
  `app/routers/`.
- `keycloak/` — `realm-export.json` (realm `hackathon`: `web` client, roles,
  users) and `themes/diametral/` (vendored Diametral login/email theme).

## Auth — how it fits together

- Frontend uses `keycloak-js`, **Authorization Code + PKCE** (PKCE is enforced on
  the `web` client). `src/lib/api.ts` attaches a fresh bearer token to every call.
- Backend `get_current_user` (`app/auth.py`) validates the JWT against the realm
  JWKS: **signature + issuer + expiry + audience**. Protect a route with
  `user: CurrentUser = Depends(get_current_user)`; gate by role with
  `Depends(require_role("admin"))`.
- **Critical internal/public URL split — do not "simplify" by unifying them:**
  the backend fetches JWKS from `KEYCLOAK_INTERNAL_URL=http://keycloak:8080`
  (compose network) but validates `iss` against
  `KEYCLOAK_ISSUER_URL=http://localhost:8080` (the host the browser uses).
  `KC_HOSTNAME=http://localhost:8080` pins the issuer so both sides agree.
- Token `aud` is `hackathon-api`, added by an audience mapper on the `web` client;
  the backend requires it via `KEYCLOAK_AUDIENCE` (set `""` to disable).

## Design system (Diametral)

- Consumed from **public npm** `@diametral/design-system` (^0.10.0). CSS:
  `import "@diametral/design-system/css/diametral.css"`. Components:
  `import { ... } from "@diametral/design-system/react"`. Use the real `.ds-*`
  components/classes — don't hand-roll styles.
- The DS **source repo is `../design-system`** on this machine. If a fix belongs
  in the design system (a component, token, the Keycloak theme), make it there.
- **Fonts**: Geist (body) + Fraunces (titles) are loaded in `frontend/index.html`.
  The brand title font **Ufficio is commercial and not in npm**, so titles fall
  back to Fraunces (intended). To use Ufficio, self-host `Ufficio-300.woff2` +
  an `@font-face`; the title stack already prefers `"Ufficio"`.
- **Theme switcher** (`ConsoleLayout themes` = Light/Dark/Sepia) needs the theme
  CSS. `src/main.tsx` imports `css/themes/dark.css` + `css/themes/sepia.css`
  explicitly because the npm bundle at this version doesn't include them.

## Adding things

- **Page**: `frontend/src/pages/Foo.tsx`, then add it to `ROUTES`/`NAV` and a
  `<Route>` in `src/App.tsx`.
- **API route**: `backend/app/routers/foo.py` (an `APIRouter`), include it in
  `app/main.py`, and add `Depends(get_current_user)` to protect it.
- **Model change**: edit `app/models.py`. Tables are `create_all`'d on startup
  (no Alembic), so a schema change only applies on a fresh DB — `make clean` to
  recreate app-db. Introduce Alembic before the schema matters.

## Code review (subagents)

This repo ships **local, committed** reviewers in `.claude/agents/` (tailored to
this stack — no plugin install required, so every clone has them):

- **`security-reviewer`** — required for any change touching `backend/app/auth.py`
  (JWKS validation, the internal/public URL split, audience, role gating). The
  repo's sharpest security surface.
- **`fastapi-reviewer`** — for backend router/schema/async/main.py changes.

Invoke them with the Task tool (e.g. "use the security-reviewer agent on
auth.py"). They were seeded from the `ecc` marketplace and then tailored.

## Verify (smoke test) — see also `/smoke`

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/realms/hackathon/protocol/openid-connect/token \
  -d grant_type=password -d client_id=web -d username=demo -d password=demo \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
curl -s http://localhost:8000/api/me -H "Authorization: Bearer $TOKEN"    # 200 + user JSON
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8000/api/me      # 403 (no token)
```

## Gotchas

- Editing `realm-export.json` has **no effect** until you wipe the keycloak-db
  volume (`make clean`) — `--import-realm` skips a realm that already exists.
- Keycloak 26 uses `KC_BOOTSTRAP_ADMIN_USERNAME`/`KC_BOOTSTRAP_ADMIN_PASSWORD`
  (not the old `KEYCLOAK_ADMIN*`); health lives on the internal mgmt port 9000.
- `admin/admin` and the seeded passwords are **dev-only** — never ship them.
- `frontend/.env` holds browser-facing `VITE_*` (always localhost) and is
  committed on purpose; real secrets must not go there.
