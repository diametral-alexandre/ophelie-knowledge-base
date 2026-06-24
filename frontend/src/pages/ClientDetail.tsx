import { Link, useParams } from "react-router-dom";
import {
  PageHeader,
  EmptyState,
  Button,
  DescriptionList,
} from "@diametral/design-system/react";

import { getClient, referencesForClient } from "../data";
import { Section } from "../lib/resourceUi";

export default function ClientDetail() {
  const { id = "" } = useParams();
  const client = getClient(id);

  if (!client) {
    return (
      <>
        <PageHeader title="Client not found" />
        <EmptyState
          title="No such client"
          description="This client doesn't exist or has been removed."
          actions={
            <Link to="/clients">
              <Button>Back to clients</Button>
            </Link>
          }
        />
      </>
    );
  }

  const references = referencesForClient(client.id);

  return (
    <>
      <PageHeader
        title={client.name}
        subtitle={client.industry}
        breadcrumb={
          <Link to="/clients" style={{ color: "var(--ds-ink-soft)", textDecoration: "none" }}>
            ← Clients
          </Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        <Section title="Engagements" aside={references.length}>
          {references.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ds-ink-faint)" }}>
              No engagements recorded.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {references.map((r, i) => (
                <Link
                  key={r.id}
                  to={`/references/${r.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 0",
                    color: "inherit",
                    textDecoration: "none",
                    borderBottom:
                      i < references.length - 1 ? "1px solid var(--ds-rule)" : "none",
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: "var(--ds-ink-faint)" }}>{r.duration}</span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Details">
          <DescriptionList items={[{ term: "Industry", desc: client.industry }]} />
        </Section>
      </div>
    </>
  );
}
