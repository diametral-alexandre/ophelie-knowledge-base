import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@diametral/design-system/react";

import { keycloak } from "../lib/keycloak";
import { currentUser } from "../lib/currentUser";
import { useDismissable } from "./useDismissable";
import { Brandmark } from "./Brandmark";
import { NAV_GROUPS, activeNavId } from "./nav";

// The left rail — Ophélie wordmark, tagline, grouped nav with an active-item
// accent bar, and a bottom user widget. The Account group lives in the user
// widget's expandable menu (not the main nav). Restyled with Diametral tokens,
// mirroring ophelieV2's Sidebar.
const ACCOUNT_GROUP = "Account";

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const me = currentUser();
  const { open, setOpen, ref } = useDismissable<HTMLDivElement>();
  const active = activeNavId(pathname);
  const role = me.roles.includes("admin") ? "Admin" : me.roles[0] ? "Member" : "—";

  // Main nav shows every group except Account; the Account items move into the
  // bottom user widget's menu.
  const topGroups = NAV_GROUPS.filter((g) => g.label !== ACCOUNT_GROUP);
  const accountItems =
    NAV_GROUPS.find((g) => g.label === ACCOUNT_GROUP)?.items ?? [];

  return (
    <aside className="oph-sidebar">
      <div className="oph-brand">
        <Brandmark size={26} />
        <span className="oph-brand-word">Ophélie</span>
      </div>
      <div className="oph-tagline">Knowledge Management System</div>

      <nav className="oph-nav">
        {topGroups.map((group) => (
          <div key={group.label}>
            <div className="oph-nav-group">{group.label}</div>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`oph-nav-item${active === item.id ? " active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="oph-nav-icon">
                  <Icon name={item.icon} size={15} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="oph-user" ref={ref}>
        {open && (
          <div className="oph-menu" role="menu">
            {accountItems.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className="oph-menu-item"
                onClick={() => {
                  setOpen(false);
                  navigate(item.path);
                }}
              >
                <Icon name={item.icon} size={14} /> {item.label}
              </button>
            ))}
            <button
              type="button"
              role="menuitem"
              className="oph-menu-item danger"
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
          {/* Clicking the identity area goes straight to the profile… */}
          <button
            type="button"
            className="oph-user-main"
            onClick={() => navigate("/profile")}
          >
            <span className="oph-avatar">{me.initials}</span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span className="oph-user-name" style={{ display: "block" }}>
                {me.name}
              </span>
              <span className="oph-user-role" style={{ display: "block" }}>
                {role}
              </span>
            </span>
          </button>
          {/* …while the chevron toggles the account menu. */}
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
