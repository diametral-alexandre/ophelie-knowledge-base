import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PageHeader,
  EmptyState,
  Button,
  DescriptionList,
} from "@diametral/design-system/react";

import { api } from "../lib/api";
import type { Client, Mission } from "../lib/types";
import { Section } from "../lib/resourceUi";

export default function ClientDetail() {
  const { id = "" } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api<Client>(`/api/clients/${id}`),
      api<Mission[]>(`/api/missions?customer_id=${id}`),
    ])
      .then(([c, m]) => {
        setClient(c);
        setMissions(m);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const backLink = (
    <Link
      to="/clients"
      style={{ color: "var(--ds-ink-soft)", textDecoration: "none" }}
    >
      ← Clients
    </Link>
  );

  if (loading) {
    return (
      <>
        <PageHeader title="Loading…" breadcrumb={backLink} />
        <EmptyState title="Loading…" description="Fetching client profile." />
      </>
    );
  }

  if (error || !client) {
    return (
      <>
        <PageHeader title="Client not found" breadcrumb={backLink} />
        <EmptyState
          title="No such client"
          description={
            error ?? "This client doesn't exist or has been removed."
          }
          actions={
            <Link to="/clients">
              <Button>Back to clients</Button>
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={client.company_name}
        subtitle={client.sector ?? undefined}
        breadcrumb={backLink}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          alignItems: "start",
        }}
      >
        <Section title="Missions" aside={missions.length}>
          {missions.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ds-ink-faint)" }}>
              No missions recorded.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {missions.map((m, i) => (
                <div
                  key={m.mission_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom:
                      i < missions.length - 1
                        ? "1px solid var(--ds-border)"
                        : "none",
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>
                    {m.mission_name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--ds-ink-faint)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Details">
          <DescriptionList
            items={[
              { term: "Sector", desc: client.sector ?? "—" },
              { term: "Contact", desc: client.contact_name ?? "—" },
              { term: "Email", desc: client.email ?? "—" },
              { term: "Phone", desc: client.phone ?? "—" },
              { term: "Address", desc: client.address ?? "—" },
            ]}
          />
        </Section>
      </div>
    </>
  );
}
