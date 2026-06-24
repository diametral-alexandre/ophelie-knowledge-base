import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useSidebar } from "./useSidebar";

// The application shell — a 2×2 grid: a full-width topbar spanning the top
// (brand + search + theme switcher), then the sidebar rail and the routed page
// beneath it. Mirrors Diametral ConsoleLayout's disposition (bar across the top,
// sidebar tucked under) but keeps the bespoke Ophélie components — icon nav, the
// bottom-left profile drop-up, the inline search palette, the theme pills.
//
// The rail is retractable (⌘B / the rail's collapse button): `collapsed` lives
// here so the `.oph-app` grid can shrink its first column in lockstep with the
// Sidebar's icon-only mode.
export function Shell({ children }: { children: ReactNode }) {
  const { collapsed, toggle } = useSidebar();
  return (
    <div className={`oph-app${collapsed ? " collapsed" : ""}`}>
      <Topbar />
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main className="oph-content">{children}</main>
    </div>
  );
}
