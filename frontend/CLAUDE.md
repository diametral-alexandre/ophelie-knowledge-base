# frontend/CLAUDE.md

Local guide for the **Ophélie knowledge base** SPA. See the root `CLAUDE.md` for
the cross-cutting map (auth, design system, run commands).

## Stack

Vite + React 18 + TypeScript. Routing via `react-router-dom` v6. Auth via
`keycloak-js` (Authorization Code + PKCE). UI is the **Diametral design system**
(`@diametral/design-system/react` + `/css/diametral.css`) — use the real `.ds-*`
components, never hand-roll styles.

## The data layer (`src/data/`) — read this first

The product is **frontend-owned**: there is no backend behind the Library yet.
`src/data/` is the single source of truth for the MVP.

- `types.ts` — the domain model, ported/trimmed from `ophelieV2`. Core entities:
  `Consultant`, `Reference` (a mission/engagement), `Client`. Relationships are
  by id: `Consultant.missionIds → Reference.id`, `Reference.consultants →
  Consultant.id`. Enums: `ConsultantStatus`, `Grade`.
- `consultants.ts`, `references.ts` — the seed records.
- `index.ts` — the barrel; import the Library from here.

When you add a field, change it in `types.ts` **and** backfill every seed record
(TS will flag the gaps). When real persistence arrives, port this model into the
backend — don't fork a second definition.

## Pages & navigation (`src/App.tsx`)

`ROUTES` (nav id → path) and `NAV` (grouped `ConsoleNavGroup` for `ConsoleLayout`)
are the **one source of truth** for navigation. Pages live in `src/pages/`:
list pages (`Consultants`, `References`, `Clients`, `Offers`) each have a
matching `*Detail` page mounted at `/:id`. `Settings` and `Profile` sit under the
Account group.

**Add a page:** create `src/pages/Foo.tsx` → add a `ROUTES` entry → add a `NAV`
item → add the `<Route>` (list + optional `/:id` detail). The `/scaffold-page`
skill automates this.

## lib/

- `keycloak.ts` — the `keycloak-js` client singleton.
- `api.ts` — `fetch` wrapper that injects + refreshes the bearer token; use it for
  every backend call so auth stays consistent.
- `currentUser.ts` — derives the display user (name/initials) from the token.
- `resourceUi.tsx` — shared presentational helpers for the resource screens.
- `config.ts` — reads `VITE_*` env (browser-facing, always localhost).

## Conventions

- TypeScript is strict; the build is `tsc -b && vite build`. A PostToolUse hook
  runs `tsc --noEmit` on edits and pre-commit type-checks — keep the tree green.
- `frontend/.env` holds only browser-facing `VITE_*` (committed on purpose).
  **Never** put a real secret there — a PreToolUse hook guards `.env` writes.
- Theme switcher (Light/Dark/Sepia) needs `css/themes/{dark,sepia}.css` imported
  explicitly in `main.tsx` (the npm bundle at ^0.10.0 omits them).
