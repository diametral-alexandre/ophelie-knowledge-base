import { Link, useParams } from "react-router-dom";
import {
  PageHeader,
  EmptyState,
  Button,
  DescriptionList,
} from "@diametral/design-system/react";

import { getReference, getClient, consultantsForReference } from "../data";
import { Section, ChipRow, PersonHead } from "../lib/resourceUi";

export default function ReferenceDetail() {
  const { id = "" } = useParams();
  const r = getReference(id);

  if (!r) {
    return (
      <>
        <PageHeader title="Reference not found" />
        <EmptyState
          title="No such reference"
          description="This engagement doesn't exist or has been removed."
          actions={
            <Link to="/references">
              <Button>Back to references</Button>
            </Link>
          }
        />
      </>
    );
  }

  const team = consultantsForReference(r.id);
  const client = getClient(r.client);

  return (
    <>
      <PageHeader
        title={r.name}
        subtitle={r.summary}
        breadcrumb={
          <Link to="/references" style={{ color: "var(--ds-ink-soft)", textDecoration: "none" }}>
            ← References
          </Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Section title="Outcomes">
            <div style={{ display: "flex", flexDirection: "column" }}>
              {r.outcomes.map((o, i) => (
                <div
                  key={o}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom:
                      i < r.outcomes.length - 1 ? "1px solid var(--ds-border)" : "none",
                  }}
                >
                  <span style={{ color: "var(--ds-accent, var(--ds-ink))" }}>✓</span>
                  <span style={{ fontSize: 14 }}>{o}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Team" aside={team.length}>
            {team.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--ds-ink-faint)" }}>
                No consultants linked.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {team.map((c) => (
                  <Link
                    key={c.id}
                    to={`/consultants/${c.id}`}
                    style={{
                      display: "block",
                      padding: "8px 0",
                      color: "inherit",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--ds-border)",
                    }}
                  >
                    <PersonHead initials={c.initials} name={c.name} sub={c.title} />
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <Section title="Skills">
            <ChipRow items={r.skills} />
          </Section>

          <Section title="Details">
            <DescriptionList
              items={[
                { term: "Industry", desc: r.industry },
                { term: "Duration", desc: r.duration },
                { term: "Size", desc: r.size },
                { term: "Role", desc: r.role },
                {
                  term: "Client",
                  desc: client ? (
                    <Link to={`/clients/${client.id}`} style={{ color: "var(--ds-accent, var(--ds-ink))" }}>
                      {client.name}
                    </Link>
                  ) : (
                    r.client
                  ),
                },
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  );
}
