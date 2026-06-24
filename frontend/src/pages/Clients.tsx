import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PageHeader,
  Card,
  Input,
  DataGrid,
  EmptyState,
} from "@diametral/design-system/react";

import { CLIENTS, referencesForClient } from "../data";
import type { Client } from "../data/types";

// Clients are derived from references (one card per distinct client). The
// engagement count comes from the same relation walk the detail page uses.
export default function Clients() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CLIENTS;
    return CLIENTS.filter((c) =>
      [c.name, c.industry].join(" ").toLowerCase().includes(needle)
    );
  }, [q]);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Every organisation the firm has delivered for, derived from references."
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Input
            placeholder="Search client, industry…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 360 }}
            aria-label="Search clients"
          />
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ds-ink-faint)" }}>
            {rows.length} client{rows.length === 1 ? "" : "s"}
          </span>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="No matches" description="No client matches that search." />
      ) : (
        <DataGrid<Client>
          rows={rows}
          rowKey={(c) => c.id}
          pageSize={rows.length}
          columns={[
            {
              key: "name",
              header: "Client",
              render: (c) => (
                <Link to={`/clients/${c.id}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 500 }}>
                  {c.name}
                </Link>
              ),
            },
            { key: "industry", header: "Industry", sortable: true, render: (c) => c.industry },
            {
              key: "engagements",
              header: "Engagements",
              align: "right",
              render: (c) => referencesForClient(c.id).length,
            },
          ]}
        />
      )}
    </>
  );
}
