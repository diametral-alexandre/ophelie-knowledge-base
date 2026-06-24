import { SearchPalette } from "./SearchPalette";
import { THEMES, useTheme } from "./theme";

// The top bar — the search palette centred, with the Light/Dark/Sepia theme
// switcher on the right (replacing ophelieV2's language switcher, same pill
// look). The theme control replaces the one ConsoleLayout used to provide.
export function Topbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="oph-topbar">
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
