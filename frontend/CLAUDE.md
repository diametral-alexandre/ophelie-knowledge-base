# frontend/CLAUDE.md

Local guide for the **Ophélie knowledge base** SPA. See the root `CLAUDE.md` for
the cross-cutting map (auth, design system, run commands).

## Stack

Vite + React 18 + TypeScript. Routing via `react-router-dom` v6. Auth via
`keycloak-js` (Authorization Code + PKCE). **Page interiors** use the **Diametral
design system** (`@diametral/design-system/react` + `/css/diametral.css`) — use
the real `.ds-*` components there, don't hand-roll styles.

The **app shell is custom** (`src/shell/`), not Diametral's `ConsoleLayout`: a
bespoke Ophélie sidebar + topbar + inline ⌘K search palette, ported from
`ophelieV2`. It's the one deliberate exception to "don't hand-roll" — but it is
styled **only with Diametral `--ds-*` tokens** (see the shell section), so it
recolours correctly under every theme. Borders are `--ds-rule` (there is **no**
`--ds-border` token — a common mistake).

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

## The shell (`src/shell/`)

The chrome around every page — replaces Diametral's `ConsoleLayout` so the look
matches `ophelieV2`.

- `nav.ts` — **the navigation source of truth.** `NAV_GROUPS` (Library +
  Account) drives both the sidebar and the search palette's "Pages" group; each
  item carries `{ id, label, path, icon, count?, sub?, keywords? }`. `NAV_ITEMS`
  is the flat list; `activeNavId(pathname)` resolves the highlighted item
  (longest matching path wins). Counts come from the seed.
- `Shell.tsx` — the `grid` layout: `<Sidebar>` rail + main column (`<Topbar>` +
  routed `<main>`). `App.tsx` wraps `<Routes>` in `<Shell>`.
- `Sidebar.tsx` — Ophélie wordmark + tagline + grouped nav (active-item accent
  bar) + bottom user menu (Profile / Sign out), via `useDismissable`.
- `Topbar.tsx` — centred `SearchPalette` + the Light/Dark/Sepia switcher.
- `SearchPalette.tsx` — inline ⌘K palette (NOT a modal): weighted keyword search
  over pages/consultants/references/clients/skills, match highlight, recent
  chips, ↑/↓/↵/esc. Reads the seed directly via `src/data`.
- `theme.ts` — `useTheme()` drives `data-theme` on `<html>` (light/dark/sepia)
  and persists it. Replaces the switcher `ConsoleLayout` used to own.
- `Brandmark.tsx` — the Diametral logo mark SVG. `useDismissable.ts` — outside-
  click/Escape toggle for the user menu.
- `shell.css` — all `.oph-*` classes; **only `--ds-*` tokens** for colour. Loaded
  in `main.tsx` after `diametral.css`.

## Pages (`src/pages/`)

List pages (`Consultants`, `References`, `Clients`, `Offers`) each have a matching
`*Detail` page mounted at `/:id`; `Settings` and `Profile` sit under the Account
group. Routes are declared in `src/App.tsx` (`/` → `/consultants`).

**Add a page:** create `src/pages/Foo.tsx` → add an entry to `NAV_GROUPS` in
`src/shell/nav.ts` → add the `<Route>` in `src/App.tsx` (list + optional `/:id`
detail). (The `/scaffold-page` skill predates the shell and edits the old
`App.tsx` `ROUTES`/`NAV`; until it's updated, put nav entries in `shell/nav.ts`.)

## lib/

- `keycloak.ts` — the `keycloak-js` client singleton.
- `api.ts` — `fetch` wrapper that injects + refreshes the bearer token; use it for
  every backend call so auth stays consistent.
- `currentUser.ts` — derives the display user (name/initials/roles) from the
  token; used by the sidebar user menu, Profile, and Settings.
- `resourceUi.tsx` — shared presentational helpers for the resource screens
  (`StatusTag`, `Section`, `PersonHead`, `ChipRow`). Inline colours use `--ds-*`
  tokens (`--ds-rule` for borders).
- `config.ts` — reads `VITE_*` env (browser-facing, always localhost).

## Conventions

- TypeScript is strict; the build is `tsc -b && vite build`. A PostToolUse hook
  runs `tsc --noEmit` on edits and pre-commit type-checks — keep the tree green.
- `frontend/.env` holds only browser-facing `VITE_*` (committed on purpose).
  **Never** put a real secret there — a PreToolUse hook guards `.env` writes.
- Theme switcher (Light/Dark/Sepia) is driven by `src/shell/theme.ts` (sets
  `data-theme` on `<html>`); it needs `css/themes/{dark,sepia}.css` imported
  explicitly in `main.tsx` (the npm bundle at ^0.10.0 omits them).
