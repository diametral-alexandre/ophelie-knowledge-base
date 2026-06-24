import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// The application shell — a fixed sidebar rail and a main column with a sticky
// topbar above the routed page. Replaces Diametral's ConsoleLayout so the
// Ophélie sidebar + inline search palette can match the original design.
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="oph-app">
      <Sidebar />
      <div className="oph-main">
        <Topbar />
        <main className="oph-content">{children}</main>
      </div>
    </div>
  );
}
