# keycloak/CLAUDE.md

Local guide for the Keycloak realm + theme. See the root `CLAUDE.md` for the
end-to-end auth flow and the internal/public URL split.

## What's here

- `realm-export.json` — the **`hackathon`** realm, imported on first boot via
  `--import-realm`. Defines:
  - **Roles** (realm): `user`, `admin`.
  - **Client** `web` — the public SPA client (Authorization Code + **PKCE
    enforced**). Carries an **audience mapper** that stamps `hackathon-api` into
    every access token's `aud` (the backend requires it).
  - **Seeded users** (dev-only): `demo`/`demo` (`user`), `admin`/`admin`
    (`user`,`admin`).
- `themes/diametral/` — the vendored Diametral **login + email** theme (FreeMarker
  `.ftl` + properties + fonts). Bind-mounted with caching off.

## The realm-import gotcha (read before editing)

`--import-realm` **skips a realm that already exists**. Editing
`realm-export.json` has **no effect** on a running stack until you wipe the
keycloak-db volume:

```bash
make clean && make up      # docker compose down -v && up --build
```

If your realm change "isn't taking," this is almost always why.

## Theme work

Edit files under `themes/diametral/**` and just **reload the login page** — theme
caching is disabled in compose, so no rebuild or volume wipe is needed (unlike
realm changes). If a fix belongs in the design system itself, make it in the DS
source repo (`../design-system`) and re-vendor.

## Keycloak 26 notes

- Admin bootstrap uses `KC_BOOTSTRAP_ADMIN_USERNAME` / `KC_BOOTSTRAP_ADMIN_PASSWORD`
  (not the old `KEYCLOAK_ADMIN*`). Admin console: `admin`/`admin` at `:8080`.
- Health/management lives on the **internal mgmt port 9000**, not 8080.
- `KC_HOSTNAME=http://localhost:8080` pins the issuer so the browser's `iss` and
  the backend's `KEYCLOAK_ISSUER_URL` agree.
- The seeded passwords and `admin/admin` are **dev-only** — never ship them.
