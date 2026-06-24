import { useCallback, useEffect, useState } from "react";

// Collapsed/expanded state for the rail — a native port of shadcn's
// SidebarProvider: a persisted boolean plus a ⌘/Ctrl+B toggle. We persist in
// localStorage (mirroring theme.ts) rather than a cookie since this is a pure
// SPA with no SSR to hydrate. Lives in Shell so both the grid (`.oph-app`
// width) and the Sidebar read the same source of truth.
const KEY = "ophelie.sidebar.v1";

function load(): boolean {
  return localStorage.getItem(KEY) === "collapsed";
}

export function useSidebar() {
  const [collapsed, setCollapsedState] = useState<boolean>(load);

  const setCollapsed = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setCollapsedState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        localStorage.setItem(KEY, value ? "collapsed" : "expanded");
        return value;
      });
    },
    [],
  );

  const toggle = useCallback(() => setCollapsed((v) => !v), [setCollapsed]);

  // ⌘B / Ctrl+B toggles the rail — shadcn's SIDEBAR_KEYBOARD_SHORTCUT. ⌘K is
  // already taken by the search palette, so there's no clash.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return { collapsed, toggle, setCollapsed };
}
