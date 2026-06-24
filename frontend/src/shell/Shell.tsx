import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// The application shell — a 2×2 grid: a full-width topbar spanning the top
// (brand + search + theme switcher), then the sidebar rail and the routed page
// beneath it. Mirrors Diametral ConsoleLayout's disposition (bar across the top,
// sidebar tucked under) but keeps the bespoke Ophélie components — icon nav, the
// bottom-left profile drop-up, the inline search palette, the theme pills.
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="oph-app">
      <Topbar />
      <Sidebar />
      <main className="oph-content">{children}</main>
    </div>
  );
}
