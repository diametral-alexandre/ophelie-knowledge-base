# frontend/CLAUDE.md

Local guide for the **Ophélie knowledge base** SPA. See the root `CLAUDE.md` for
the cross-cutting map (auth, design system, run commands).

## Stack

Vite + React 18 + TypeScript. Routing via `react-router-dom` v6. Auth via
`keycloak-js` (Authorization Code + PKCE). **Page interiors** use the **Diametral
design system** (`@diametral/design-system/react` + `/css/diametral.css`) — use
the real `.ds-*` components there, don't hand-roll styles.

The **app shell is custom** (`src/shell/`), laid out as a 2×2 CSS grid that
mirrors Diametral `ConsoleLayout`'s disposition (a full-width topbar spanning the
top, the sidebar tucked beneath it, a centered content column) — but built from
bespoke Ophélie components rather than `ConsoleLayout` itself: an icon nav, a
bottom-left profile drop-up menu, the inline ⌘K search palette, and the
Light/Dark/Sepia theme pills. It's the one deliberate exception to "don't
hand-roll" — but it is styled **only with Diametral `--ds-*` tokens** (see the
shell section), so it recolours correctly under every theme. Borders are
`--ds-rule` (there is **no** `--ds-border` token — a common mistake).

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

The chrome around every page — a custom topbar + sidebar in a 2×2 grid
(`.oph-app`: `grid-template-columns: 232px 1fr; grid-template-rows: auto 1fr`).
The topbar spans both columns (`grid-column: 1 / -1`); the sidebar sits in row 2
col 1, sticky beneath the topbar (`top: var(--oph-topbar-h)`).

- `nav.ts` — **the navigation source of truth.** `NAV_GROUPS` (Library +
  Account) drives both the sidebar and the search palette's "Pages" group; each
  item carries `{ id, label, path, icon, sub?, keywords? }` (`icon` is a
  Diametral `IconName`). `NAV_ITEMS` is the flat list; `activeNavId(pathname)`
  resolves the highlighted item (longest matching path wins).
- `Shell.tsx` — the grid: `<Topbar>` (row 1, full width) + `<Sidebar>` (row 2,
  col 1) + routed `<main>` (row 2, col 2). `App.tsx` wraps `<Routes>` in
  `<Shell>`.
- `Topbar.tsx` — the brand wordmark (`Brandmark` + Ophélie + `Knowledge Base`
  tag, clickable → home) on the left, centred `SearchPalette`, and the
  Light/Dark/Sepia theme pills on the right.
- `Sidebar.tsx` — grouped nav with an active-item accent bar + icons (**only
  non-Account groups** render here) + a bottom-left user widget: the identity
  area navigates to Profile, the chevron toggles a drop-up menu (the `Account`
  group's items — Settings/Profile — + Sign out), via `useDismissable`.
- `SearchPalette.tsx` — inline ⌘K palette (NOT a modal): weighted keyword search
  over pages/consultants/references/clients/skills, match highlight, recent
  chips, ↑/↓/↵/esc. Reads the seed directly via `src/data`.
- `theme.ts` — `useTheme()` drives `data-theme` on `<html>` (light/dark/sepia)
  and persists it; the theme pills in `Topbar.tsx` are wired to it.
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
