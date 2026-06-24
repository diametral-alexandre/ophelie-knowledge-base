import { Routes, Route, Navigate } from "react-router-dom";

import { Shell } from "./shell/Shell";
import Consultants from "./pages/Consultants";
import ConsultantDetail from "./pages/ConsultantDetail";
import References from "./pages/References";
import ReferenceDetail from "./pages/ReferenceDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Offers from "./pages/Offers";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

// The shell (sidebar + topbar + search palette) wraps the routed pages. The nav
// model lives in src/shell/nav.ts — the single source of truth shared by the
// sidebar and the search palette. Add a page = add it there + a <Route> below.
export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/consultants" replace />} />
        <Route path="/consultants" element={<Consultants />} />
        <Route path="/consultants/:id" element={<ConsultantDetail />} />
        <Route path="/references" element={<References />} />
        <Route path="/references/:id" element={<ReferenceDetail />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/consultants" replace />} />
      </Routes>
    </Shell>
  );
}
