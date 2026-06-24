import { useCallback, useEffect, useState } from "react";

// Diametral ships Light / Dark / Sepia as [data-theme] scoped stylesheets
// (imported in main.tsx). ConsoleLayout used to own this switcher; since the
// custom shell replaces ConsoleLayout, this hook drives `data-theme` on <html>
// and persists the choice — same three options, same mechanism.
export type Theme = "light" | "dark" | "sepia";

export const THEMES: Theme[] = ["light", "dark", "sepia"];

const KEY = "ophelie.theme.v1";

function apply(theme: Theme) {
  const el = document.documentElement;
  if (theme === "light") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", theme);
}

function load(): Theme {
  const raw = localStorage.getItem(KEY) as Theme | null;
  return raw && THEMES.includes(raw) ? raw : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(load);

  useEffect(() => {
    apply(theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(KEY, t);
    setThemeState(t);
  }, []);

  return { theme, setTheme };
}
