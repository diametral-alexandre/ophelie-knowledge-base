import { PageHeader, EmptyState } from "@diametral/design-system/react";

// Offers (appels d'offres) — the staffing workflow from ophelieV2 lands here.
// Left intentionally empty for now: the nav slot and route exist so the screen
// can be filled in without touching the shell.
export default function Offers() {
  return (
    <>
      <PageHeader
        title="Offers"
        subtitle="Incoming calls for tender (appels d'offres) and the staffing workflow."
      />
      <EmptyState
        icon="◷"
        title="Nothing here yet"
        description="Offers will appear here once the intake and matching workflow is wired up. For now this is a placeholder in the Library."
      />
    </>
  );
}
