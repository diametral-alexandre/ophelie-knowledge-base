import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon, Avatar } from "@diametral/design-system/react";

import { keycloak } from "../lib/keycloak";
import { currentUser } from "../lib/currentUser";
import { useDismissable } from "./useDismissable";
import { NAV_GROUPS, activeNavId } from "./nav";

// The left rail (beneath the full-width topbar) — grouped nav with an
// active-item accent bar and icons, plus a bottom-left user widget with a
// drop-up account menu. The brand wordmark lives in the topbar; the Account
// group lives in the user widget's expandable menu (not the main nav).
//
// Interactions ported from shadcn's sidebar, rebuilt in the Diametral idiom:
//  • retractable to an icon-only rail (the `collapsed` prop, driven by Shell);
//  • collapsible nav groups (per-group, persisted) when expanded;
//  • hover tooltips on the icons while collapsed (CSS, via `data-label`).
const ACCOUNT_GROUP = "Account";
const GROUPS_KEY = "ophelie.sidebar.groups.v1";

// Closed group labels persist across reloads, like the rail's collapsed state.
function loadClosedGroups(): Set<string> {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const me = currentUser();
  const { open, setOpen, ref } = useDismissable<HTMLDivElement>();
  const [closedGroups, setClosedGroups] =
    useState<Set<string>>(loadClosedGroups);
  const active = activeNavId(pathname);
  const role = me.roles.includes("admin")
    ? "Admin"
    : me.roles[0]
      ? "Member"
      : "—";

  // Main nav shows every group except Account; the Account items move into the
  // bottom user widget's menu.
  const topGroups = NAV_GROUPS.filter((g) => g.label !== ACCOUNT_GROUP);
  const accountItems =
    NAV_GROUPS.find((g) => g.label === ACCOUNT_GROUP)?.items ?? [];

  function toggleGroup(label: string) {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      localStorage.setItem(GROUPS_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <aside className="oph-sidebar">
      <nav className="oph-nav">
        {topGroups.map((group) => {
          // Group folding only applies while expanded; the icon rail always
          // shows every item (there are no headers to fold against).
          const closed = !collapsed && closedGroups.has(group.label);
          return (
            <div key={group.label} className="oph-nav-section">
              {!collapsed && (
                <button
                  type="button"
                  className={`oph-nav-group${closed ? " closed" : ""}`}
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={!closed}
                >
                  <span>{group.label}</span>
                  <span className="oph-group-chevron" aria-hidden="true">
                    <Icon name="chevron-down" size={12} />
                  </span>
                </button>
              )}
              {!closed &&
                group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`oph-nav-item${active === item.id ? " active" : ""}`}
                    onClick={() => navigate(item.path)}
                    aria-label={item.label}
                    aria-current={active === item.id ? "page" : undefined}
                    data-label={item.label}
                  >
                    <span className="oph-nav-icon">
                      <Icon name={item.icon} size={15} />
                    </span>
                    <span className="oph-nav-label">{item.label}</span>
                  </button>
                ))}
            </div>
          );
        })}
      </nav>

      {/* Rail collapse toggle — also bound to ⌘B in useSidebar. */}
      <div className="oph-rail-foot">
        <button
          type="button"
          className="oph-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-label={collapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
        >
          <span className="oph-nav-icon oph-collapse-icon" aria-hidden="true">
            <Icon name="chevron-left" size={16} />
          </span>
          <span className="oph-nav-label">Collapse</span>
        </button>
      </div>

      <div className="oph-user" ref={ref}>
        {open && (
          <div className="oph-menu ds-menu" role="menu">
            {accountItems.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className="ds-menu__item"
                onClick={() => {
                  setOpen(false);
                  navigate(item.path);
                }}
              >
                <Icon name={item.icon} size={14} /> {item.label}
              </button>
            ))}
            <div className="ds-menu__divider" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="ds-menu__item ds-menu__item--danger"
              onClick={() => {
                setOpen(false);
                keycloak.logout({ redirectUri: window.location.origin });
              }}
            >
              <Icon name="log-out" size={14} /> Sign out
            </button>
          </div>
        )}
        <div className="oph-user-row">
          {/* Expanded: the identity area goes to the profile, the chevron
              toggles the menu. Collapsed: only the avatar shows, so it takes
              over the menu toggle (keeping Settings/Sign-out reachable). */}
          <button
            type="button"
            className="oph-user-main"
            onClick={() =>
              collapsed ? setOpen((v) => !v) : navigate("/profile")
            }
            aria-label={collapsed ? "Account menu" : "Open profile"}
            aria-haspopup={collapsed ? "menu" : undefined}
            aria-expanded={collapsed ? open : undefined}
            data-label={me.name}
          >
            <Avatar initials={me.initials} size="sm" />
            <span className="oph-user-text" style={{ minWidth: 0, flex: 1 }}>
              <span className="oph-user-name" style={{ display: "block" }}>
                {me.name}
              </span>
              <span className="oph-user-role" style={{ display: "block" }}>
                {role}
              </span>
            </span>
          </button>
          {/* …while the chevron toggles the account menu (expanded only). */}
          <button
            type="button"
            className="oph-user-toggle"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name="chevron-up" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
