---
name: scaffold-page
description: Scaffold a new page (and optional /:id detail page) in the Ophélie frontend. Use when the user asks to "add a page", "create a screen", "add a route", or add a new Library resource to the React app. Wires the page into ROUTES, NAV, and <Route> in src/App.tsx following the repo's single-source-of-truth navigation model.
---

# Scaffold a frontend page

Automates the "Add a page" recipe documented in `frontend/CLAUDE.md`. The
frontend's navigation has **one source of truth** in `src/App.tsx`: a `ROUTES`
array (nav id → path) and a `NAV` array (grouped `ConsoleNavGroup`). A page is not
"added" until it appears in `ROUTES`, `NAV`, and a `<Route>`.

## Inputs to resolve first

Ask the user (or infer from the request) before writing:

1. **Page name / nav id** — e.g. `proposals` (kebab/lowercase id), label `Proposals`.
2. **Nav group** — `Library` (resources) or `Account`. Default `Library`.
3. **Detail page?** — does it need a `/:id` detail view (like Consultants →
   ConsultantDetail)? Most Library resources do.
4. **Backed by `src/data/`?** — does it render a seeded collection from
   `src/data/` (the client-owned Library), or is it a standalone screen
   (like Settings/Profile)?

## Steps

1. **Create the list page** `frontend/src/pages/<Name>.tsx`. Mirror an existing
   sibling — `Consultants.tsx` for a data-backed list, `Settings.tsx` for a
   standalone screen. Use Diametral `@diametral/design-system/react` components
   (`.ds-*`); never hand-roll styles. If data-backed, import the collection from
   `../data` and the row/card helpers from `../lib/resourceUi`.
2. **Create the detail page** (if requested) `frontend/src/pages/<Name>Detail.tsx`,
   reading the `:id` route param (`useParams`) and looking the record up in the
   `src/data/` collection. Model it on `ConsultantDetail.tsx`.
3. **Wire `src/App.tsx`** — make all four edits:
   - import the new page component(s) at the top;
   - add `{ id: "<id>", path: "/<id>" }` to `ROUTES` (+ the detail path is covered
     by the same id);
   - add `{ id: "<id>", label: "<Label>" }` to the right `NAV` group;
   - add `<Route path="/<id>" element={<Name />} />` (and
     `<Route path="/<id>/:id" element={<NameDetail />} />` if a detail page).
4. **If the resource needs a new domain type**, add it to `src/data/types.ts` and
   seed it in a new `src/data/<name>.ts`, then export from `src/data/index.ts`.
   Keep `types.ts` the single source of truth (it will later be ported to the
   backend — don't fork the definition).

## Verify

- The PostToolUse hook runs `tsc --noEmit`; resolve any type errors it reports.
- Optionally `cd frontend && npm run build` for a full check.
- Navigate to `/<id>` in the running app (`make up`) and confirm the nav item is
  active and the page renders.

## Conventions

- Match the surrounding pages' import order, naming, and comment density.
- Routes resolve "active nav" by longest path prefix (`activeId` in `App.tsx`), so
  detail routes share their list page's nav id automatically — no extra NAV entry.
