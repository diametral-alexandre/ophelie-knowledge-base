import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  ConsoleLayout,
  Badge,
  type ConsoleNavGroup,
} from "@diametral/design-system/react";

import { keycloak } from "./lib/keycloak";
import { currentUser } from "./lib/currentUser";
import Consultants from "./pages/Consultants";
import ConsultantDetail from "./pages/ConsultantDetail";
import References from "./pages/References";
import ReferenceDetail from "./pages/ReferenceDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Offers from "./pages/Offers";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

/* ---------------------------------------------------------------------------
   Navigation model — one source of truth. Each entry has the ConsoleLayout nav
   `id`, the route `path` it maps to, and the `prefix` used to resolve the
   active item. Add a page = add a line here + a <Route> below.
   --------------------------------------------------------------------------- */
type NavEntry = { id: string; path: string };

const ROUTES: NavEntry[] = [
  { id: "consultants", path: "/consultants" },
  { id: "references", path: "/references" },
  { id: "clients", path: "/clients" },
  { id: "offers", path: "/offers" },
  { id: "settings", path: "/settings" },
  { id: "profile", path: "/profile" },
];

const NAV: ConsoleNavGroup[] = [
  {
    group: "Library",
    items: [
      { id: "consultants", label: "Consultants" },
      { id: "references", label: "References" },
      { id: "clients", label: "Clients" },
      { id: "offers", label: "Offers" },
    ],
  },
  {
    group: "Account",
    items: [
      { id: "settings", label: "Settings" },
      { id: "profile", label: "Profile" },
    ],
  },
];

/** Pick the nav id whose path best matches the current location. */
function activeId(pathname: string): string {
  const match = [...ROUTES]
    .sort((a, b) => b.path.length - a.path.length)
    .find((r) => pathname.startsWith(r.path));
  return match?.id ?? "consultants";
}

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const me = currentUser();

  const onNavigate = (id: string) => {
    const entry = ROUTES.find((r) => r.id === id);
    if (entry) navigate(entry.path);
  };

  return (
    <ConsoleLayout
      brand={{ name: "Ophélie", sub: "Knowledge base" }}
      nav={NAV}
      active={activeId(pathname)}
      onNavigate={onNavigate}
      themes
      searchPlaceholder="Search…"
      user={{
        initials: me.initials,
        name: me.name,
        onSignOut: () => keycloak.logout({ redirectUri: window.location.origin }),
      }}
      actions={<Badge variant="accent">Diametral</Badge>}
    >
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
    </ConsoleLayout>
  );
}
