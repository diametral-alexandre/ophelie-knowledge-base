import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@diametral/design-system/react";

import { keycloak } from "../lib/keycloak";
import { currentUser } from "../lib/currentUser";
import { useDismissable } from "./useDismissable";
import { Brandmark } from "./Brandmark";
import { NAV_GROUPS, activeNavId } from "./nav";

// The left rail — Ophélie wordmark, tagline, grouped nav with live counts and
// an active-item accent bar, and a bottom user menu. Mirrors ophelieV2's
// Sidebar, restyled with Diametral tokens.
export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const me = currentUser();
  const { open, setOpen, ref } = useDismissable<HTMLDivElement>();
  const active = activeNavId(pathname);
  const role = me.roles.includes("admin") ? "Admin" : me.roles[0] ? "Member" : "—";

  return (
    <aside className="oph-sidebar">
      <div className="oph-brand">
        <Brandmark size={26} />
        <span className="oph-brand-word">Ophélie</span>
      </div>
      <div className="oph-tagline">The firm's knowledge base.</div>

      <nav className="oph-nav">
        {NAV_GROUPS.map((group) => (
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
                {item.count !== undefined && (
                  <span className="oph-nav-count">{item.count}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="oph-user" ref={ref}>
        {open && (
          <div className="oph-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              className="oph-menu-item"
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
            >
              <Icon name="user" size={14} /> Profile
            </button>
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
        <button
          type="button"
          className="oph-user-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
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
          <Icon name="chevron-up" size={12} />
        </button>
      </div>
    </aside>
  );
}
