import type { IconName } from "@diametral/design-system/react";

// Single source of truth for the sidebar nav and the search palette's "Pages"
// group. Mirrors ophelieV2's grouped sidebar: a Library group of resources and
// an Account group.
/** A collapsible sub-view under a nav item (sidebar-07's NavMain children). */
export interface NavChild {
  id: string;
  label: string;
  /** May carry a query string (e.g. `/consultants?status=available`). */
  path: string;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: IconName;
  /** Search-palette helpers: a one-line description + extra match keywords. */
  sub?: string;
  keywords?: string[];
  /** Collapsible sub-views shown beneath the item when the rail is expanded. */
  children?: NavChild[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Library",
    items: [
      {
        id: "consultants",
        label: "Consultants",
        path: "/consultants",
        icon: "users",
        sub: "Browse the firm's directory",
        keywords: ["directory", "bench", "people", "team"],
        children: [
          {
            id: "consultants-available",
            label: "Available",
            path: "/consultants?status=available",
          },
          {
            id: "consultants-staffed",
            label: "Staffed",
            path: "/consultants?status=staffed",
          },
        ],
      },
      {
        id: "references",
        label: "References",
        path: "/references",
        icon: "folder",
        sub: "Delivered missions and proof points",
        keywords: ["missions", "past", "engagements"],
      },
      {
        id: "clients",
        label: "Clients",
        path: "/clients",
        icon: "home",
        sub: "Organisations we've delivered for",
        keywords: ["accounts", "customers"],
      },
      {
        id: "offers",
        label: "Offers",
        path: "/offers",
        icon: "list",
        sub: "Incoming calls for tender",
        keywords: ["ao", "appel", "tender", "rfp"],
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        id: "settings",
        label: "Settings",
        path: "/settings",
        icon: "settings",
        sub: "Appearance, notifications, account",
        keywords: ["config", "preferences", "theme"],
      },
      {
        id: "profile",
        label: "Profile",
        path: "/profile",
        icon: "user",
        sub: "Your account and bio",
        keywords: ["me", "account", "bio"],
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Resolve the active nav id from a pathname (longest matching path wins). */
export function activeNavId(pathname: string): string {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find((it) => pathname.startsWith(it.path));
  return match?.id ?? "consultants";
}

/** A single breadcrumb hop; `path` set when the crumb is a link. */
export interface Crumb {
  label: string;
  path?: string;
}

/**
 * The breadcrumb trail for a pathname: `group › page` on a list route, and
 * `group › page(link) › Details` on a `/:id` detail route. Mirrors sidebar-07's
 * header breadcrumb, driven by the same NAV_GROUPS source of truth.
 */
export function breadcrumbFor(pathname: string): Crumb[] {
  const id = activeNavId(pathname);
  for (const group of NAV_GROUPS) {
    const item = group.items.find((it) => it.id === id);
    if (!item) continue;
    const onDetail = pathname.startsWith(item.path) && pathname.length > item.path.length;
    const crumbs: Crumb[] = [
      { label: group.label },
      { label: item.label, path: onDetail ? item.path : undefined },
    ];
    if (onDetail) crumbs.push({ label: "Details" });
    return crumbs;
  }
  return [];
}
