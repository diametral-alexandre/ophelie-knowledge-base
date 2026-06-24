import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PageHeader,
  Card,
  Input,
  DataGrid,
  EmptyState,
} from "@diametral/design-system/react";

import { api } from "../lib/api";
import type { Client } from "../lib/types";

function ClientLogo({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: 32,
          height: 32,
          objectFit: "contain",
          borderRadius: 4,
          border: "1px solid var(--ds-border)",
          background: "#fff",
          padding: 2,
          flexShrink: 0,
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 4,
        background: "var(--ds-surface-raised)",
        border: "1px solid var(--ds-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        color: "var(--ds-ink-soft)",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api<Client[]>("/api/clients")
      .then(setClients)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((c) =>
      [c.company_name, c.sector ?? "", c.contact_name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [q, clients]);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Every organisation the firm has delivered for."
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Input
            placeholder="Search client, sector…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 360 }}
            aria-label="Search clients"
          />
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "var(--ds-ink-faint)",
            }}
          >
            {rows.length} client{rows.length === 1 ? "" : "s"}
          </span>
        </div>
      </Card>

      {loading ? (
        <EmptyState
          title="Loading…"
          description="Fetching clients from the server."
        />
      ) : error ? (
        <EmptyState title="Could not load clients" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No matches"
          description="No client matches that search."
        />
      ) : (
        <DataGrid<Client>
          rows={rows}
          rowKey={(c) => c.customer_id}
          pageSize={rows.length}
          columns={[
            {
              key: "company_name",
              header: "Client",
              render: (c) => (
                <Link
                  to={`/clients/${c.customer_id}`}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <ClientLogo src={c.logo_url} name={c.company_name} />
                  <span style={{ fontWeight: 500 }}>{c.company_name}</span>
                </Link>
              ),
            },
            {
              key: "sector",
              header: "Sector",
              sortable: true,
              render: (c) => c.sector ?? "—",
            },
            {
              key: "contact_name",
              header: "Contact",
              render: (c) => c.contact_name ?? "—",
            },
          ]}
        />
      )}
    </>
  );
}
