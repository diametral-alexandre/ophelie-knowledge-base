import { keycloak } from "./keycloak";

interface KcToken {
  name?: string;
  preferred_username?: string;
  email?: string;
  realm_access?: { roles?: string[] };
}

export interface CurrentUser {
  name: string;
  username: string;
  email: string;
  roles: string[];
  initials: string;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const raw =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return raw.toUpperCase();
}

// Reads the signed-in user straight off the validated Keycloak token. Roles
// come from realm_access; the app-level roles seeded in the realm are `user`
// and `admin`.
export function currentUser(): CurrentUser {
  const t = (keycloak.tokenParsed ?? {}) as KcToken;
  const name = t.name ?? t.preferred_username ?? "User";
  return {
    name,
    username: t.preferred_username ?? "—",
    email: t.email ?? "—",
    roles: t.realm_access?.roles?.filter((r) => ["user", "admin"].includes(r)) ?? [],
    initials: initialsOf(name),
  };
}
