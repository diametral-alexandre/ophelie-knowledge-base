import { useNavigate } from "react-router-dom";
import { Icon } from "@diametral/design-system/react";

import { SearchPalette } from "./SearchPalette";
import { THEMES, useTheme } from "./theme";
import { Brandmark } from "./Brandmark";

interface TopbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// The full-width top bar — the Ophélie brand wordmark and the sidebar trigger
// (the rail's collapse control) on the left, the search palette centred, and the
// Light/Dark/Sepia theme switcher on the right (same pill look as ophelieV2's
// language switcher). The theme control replaces the one ConsoleLayout used to
// provide.
export function Topbar({ collapsed, onToggle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="oph-topbar">
      <button
        type="button"
        className="oph-topbar-brand"
        onClick={() => navigate("/")}
        aria-label="Ophélie — home"
      >
        <Brandmark size={26} />
        <span className="oph-brand-word">Ophélie</span>
        <span className="oph-brand-divider" aria-hidden="true" />
        <span className="oph-brand-tag">Knowledge Base</span>
      </button>

      <button
        type="button"
        className="oph-trigger"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        title="Toggle sidebar (⌘B)"
      >
        <Icon name="menu" size={18} />
      </button>

      <div className="oph-topbar-center">
        <SearchPalette placeholder="Search consultants, references, clients…" />
      </div>
      <div className="oph-themes" role="group" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            className={`oph-theme-btn${theme === t ? " active" : ""}`}
            onClick={() => setTheme(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </header>
  );
}
