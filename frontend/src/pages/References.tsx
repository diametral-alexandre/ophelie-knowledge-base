import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PageHeader,
  Card,
  Input,
  DataGrid,
  EmptyState,
} from "@diametral/design-system/react";

import { REFERENCES, sortReferences } from "../data";
import type { Reference } from "../data/types";

// Past missions / references — the proof points the firm pitches with. Search
// spans title, client, industry and skills.
export default function References() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = sortReferences(REFERENCES);
    if (!needle) return base;
    return base.filter((r) =>
      [r.name, r.client, r.industry, r.role, ...r.skills]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [q]);

  return (
    <>
      <PageHeader
        title="References"
        subtitle="Delivered missions — the engagements we cite to win the next one."
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Input
            placeholder="Search title, client, skill…"
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

      {rows.length === 0 ? (
        <EmptyState title="No matches" description="No reference matches that search." />
      ) : (
        <DataGrid<Reference>
          rows={rows}
          rowKey={(r) => r.id}
          pageSize={rows.length}
          columns={[
            {
              key: "title",
              header: "Reference",
              render: (r) => (
                <Link to={`/references/${r.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                  <div style={{ fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ds-ink-soft)" }}>{r.client}</div>
                </Link>
              ),
            },
            { key: "industry", header: "Industry", sortable: true, render: (r) => r.industry },
            {
              key: "duration",
              header: "Duration",
              render: (r) => r.duration,
            },
            {
              key: "team",
              header: "Team",
              align: "right",
              sortable: true,
              render: (r) => r.team,
            },
          ]}
        />
      )}
    </>
  );
}
