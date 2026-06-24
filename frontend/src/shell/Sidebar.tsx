import { useEffect, useState } from "react";
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
// Interactions ported from shadcn's sidebar-07, rebuilt in the Diametral idiom:
//  • retractable to an icon-only rail (the `collapsed` prop, driven by Shell);
//  • collapsible nav groups (per-group, persisted) when expanded;
//  • collapsible sub-items per nav entry (NavMain's Collapsible children);
//  • hover tooltips on the icons while collapsed (CSS, via `data-label`).
const ACCOUNT_GROUP = "Account";
const GROUPS_KEY = "ophelie.sidebar.groups.v1";
const EXPANDED_KEY = "ophelie.sidebar.expanded.v1";

// Closed group labels persist across reloads, like the rail's collapsed state.
function loadClosedGroups(): Set<string> {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

// Expanded sub-menu item ids persist too (shadcn's per-item Collapsible state).
function loadExpanded(): Set<string> {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

// A compact ⇕ affordance — Diametral's Lucide set has no `chevrons-up-down`, so
// we stack the two single chevrons (sidebar-07's NavUser trailing icon).
function ChevronsUpDown() {
  return (
    <span className="oph-chevrons oph-user-caret" aria-hidden="true">
      <Icon name="chevron-up" size={12} />
      <Icon name="chevron-down" size={12} />
    </span>
  );
}

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const me = currentUser();
  const { open, setOpen, ref } = useDismissable<HTMLDivElement>();
  const [closedGroups, setClosedGroups] =
    useState<Set<string>>(loadClosedGroups);
  const [expanded, setExpanded] = useState<Set<string>>(loadExpanded);
  const active = activeNavId(pathname);
  // Full location (path + query) — sub-items deep-link with a `?status=` query,
  // so child highlighting must compare the search string too.
  const current = pathname + search;

  // Main nav shows every group except Account; the Account items move into the
  // bottom user widget's menu.
  const topGroups = NAV_GROUPS.filter((g) => g.label !== ACCOUNT_GROUP);
  const accountItems =
    NAV_GROUPS.find((g) => g.label === ACCOUNT_GROUP)?.items ?? [];

  // Auto-open the active item's sub-menu when navigation lands on it
  // (shadcn's `defaultOpen={item.isActive}`), without clobbering manual toggles.
  useEffect(() => {
    const item = topGroups
      .flatMap((g) => g.items)
      .find((it) => it.id === active && it.children?.length);
    if (item) {
      setExpanded((prev) =>
        prev.has(item.id) ? prev : new Set(prev).add(item.id),
      );
    }
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleGroup(label: string) {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      localStorage.setItem(GROUPS_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(EXPANDED_KEY, JSON.stringify([...next]));
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
                group.items.map((item) => {
                  const isActive = active === item.id;
                  const hasChildren = !!item.children?.length;
                  // Sub-items only render when the rail is expanded and the
                  // item is open; collapsed rail stays icon-only.
                  const subOpen = hasChildren && !collapsed && expanded.has(item.id);

                  // Plain item (no children) — unchanged single button.
                  if (!hasChildren) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`oph-nav-item${isActive ? " active" : ""}`}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                        data-label={item.label}
                      >
                        <span className="oph-nav-icon">
                          <Icon name={item.icon} size={15} />
                        </span>
                        <span className="oph-nav-label">{item.label}</span>
                      </button>
                    );
                  }

                  // Collapsible item — the label navigates, the caret folds.
                  return (
                    <div key={item.id} className="oph-nav-block">
                      <div className="oph-nav-row">
                        <button
                          type="button"
                          className={`oph-nav-item oph-nav-item--parent${isActive ? " active" : ""}`}
                          onClick={() => navigate(item.path)}
                          aria-label={item.label}
                          aria-current={isActive ? "page" : undefined}
                          data-label={item.label}
                        >
                          <span className="oph-nav-icon">
                            <Icon name={item.icon} size={15} />
                          </span>
                          <span className="oph-nav-label">{item.label}</span>
                        </button>
                        {!collapsed && (
                          <button
                            type="button"
                            className={`oph-nav-caret${subOpen ? " open" : ""}`}
                            onClick={() => toggleExpand(item.id)}
                            aria-label={`Toggle ${item.label} sub-menu`}
                            aria-expanded={subOpen}
                          >
                            <Icon name="chevron-right" size={14} />
                          </button>
                        )}
                      </div>
                      {subOpen && (
                        <div className="oph-subnav">
                          {item.children!.map((child) => {
                            const childActive = current === child.path;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                className={`oph-subitem${childActive ? " active" : ""}`}
                                onClick={() => navigate(child.path)}
                                aria-current={childActive ? "page" : undefined}
                              >
                                {child.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Footer profile section (sidebar-07's NavUser) — the whole row is the
          menu trigger; the account menu opens upward. The rail is collapsed
          from the topbar trigger (⌘B), so there's no in-rail collapse button. */}
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
        <button
          type="button"
          className="oph-user-main"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account menu"
          data-label={me.name}
        >
          <Avatar initials={me.initials} size="sm" />
          <span className="oph-user-text" style={{ minWidth: 0, flex: 1 }}>
            <span className="oph-user-name" style={{ display: "block" }}>
              {me.name}
            </span>
            <span className="oph-user-role" style={{ display: "block" }}>
              {me.email}
            </span>
          </span>
          <ChevronsUpDown />
        </button>
      </div>
    </aside>
  );
}
