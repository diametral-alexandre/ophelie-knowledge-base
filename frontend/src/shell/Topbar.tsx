import { useNavigate } from "react-router-dom";

import { SearchPalette } from "./SearchPalette";
import { THEMES, useTheme } from "./theme";
import { Brandmark } from "./Brandmark";

// The full-width top bar — the Ophélie brand wordmark on the left, the search
// palette centred, and the Light/Dark/Sepia theme switcher on the right (same
// pill look as ophelieV2's language switcher). The theme control replaces the
// one ConsoleLayout used to provide. The rail's collapse trigger lives in the
// sidebar itself (and ⌘B), not here.
export function Topbar() {
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
