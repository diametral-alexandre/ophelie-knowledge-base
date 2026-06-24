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
import type { Client, Mission } from "../lib/types";

export default function References() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [clientMap, setClientMap] = useState<Map<number, Client>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    Promise.all([
      api<Mission[]>("/api/missions"),
      api<Client[]>("/api/clients"),
    ])
      .then(([ms, cs]) => {
        setMissions(ms);
        setClientMap(new Map(cs.map((c) => [c.customer_id, c])));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const sorted = [...missions].sort((a, b) => {
      if (a.status === b.status) return a.mission_id - b.mission_id;
      return a.status === "In Progress" ? -1 : 1;
    });
    if (!needle) return sorted;
    return sorted.filter((m) => {
      const client = clientMap.get(m.customer_id);
      return [m.mission_name, m.status, client?.company_name ?? "", client?.sector ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [q, missions, clientMap]);

  return (
    <>
      <PageHeader
        title="References"
        subtitle="Delivered missions — the engagements we cite to win the next one."
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Input
            placeholder="Search title, client, status…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 360 }}
            aria-label="Search references"
          />
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ds-ink-faint)" }}>
            {rows.length} reference{rows.length === 1 ? "" : "s"}
          </span>
        </div>
      </Card>

      {loading ? (
        <EmptyState title="Loading…" description="Fetching references from the server." />
      ) : error ? (
        <EmptyState title="Could not load references" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState title="No matches" description="No reference matches that search." />
      ) : (
        <DataGrid<Mission>
          rows={rows}
          rowKey={(m) => m.mission_id}
          pageSize={rows.length}
          columns={[
            {
              key: "mission_name",
              header: "Reference",
              render: (m) => (
                <Link to={`/references/${m.mission_id}`} style={{ color: "inherit", textDecoration: "none" }}>
                  <div style={{ fontWeight: 500 }}>{m.mission_name}</div>
                  <div style={{ fontSize: 12, color: "var(--ds-ink-soft)" }}>
                    {clientMap.get(m.customer_id)?.company_name ?? "—"}
                  </div>
                </Link>
              ),
            },
            {
              key: "sector",
              header: "Sector",
              sortable: true,
              render: (m) => clientMap.get(m.customer_id)?.sector ?? "—",
            },
            {
              key: "status",
              header: "Status",
              sortable: true,
              render: (m) => m.status,
            },
            {
              key: "dates",
              header: "Dates",
              render: (m) =>
                m.start_date && m.end_date
                  ? `${m.start_date} → ${m.end_date}`
                  : m.start_date ?? "—",
            },
          ]}
        />
      )}
    </>
  );
}
