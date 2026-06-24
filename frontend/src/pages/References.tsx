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
import type { ReferenceListItem } from "../lib/types";
import { PersonHead } from "../lib/resourceUi";

export default function References() {
  const [references, setReferences] = useState<ReferenceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api<ReferenceListItem[]>("/api/references")
      .then(setReferences)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return references;
    return references.filter((r) =>
      [
        r.first_name ?? "",
        r.last_name ?? "",
        r.company_name,
        r.mission_name,
        r.role_description ?? "",
        r.skill_name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [q, references]);

  return (
    <>
      <PageHeader
        title="References"
        subtitle="Delivered missions — the engagements we cite to win the next one."
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Input
            placeholder="Search consultant, company, role…"
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
        <DataGrid<ReferenceListItem>
          rows={rows}
          rowKey={(r) => r.reference_id}
          pageSize={rows.length}
          columns={[
            {
              key: "employee",
              header: "Consultant",
              render: (r) =>
                r.employee_id ? (
                  <Link
                    to={`/consultants/${r.employee_id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <PersonHead
                      initials={`${r.first_name?.[0] ?? ""}${r.last_name?.[0] ?? ""}`.toUpperCase()}
                      name={`${r.first_name ?? ""} ${r.last_name ?? ""}`.trim()}
                      src={r.profile_image_url ?? undefined}
                    />
                  </Link>
                ) : (
                  <span style={{ color: "var(--ds-ink-faint)" }}>—</span>
                ),
            },
            {
              key: "company",
              header: "Company",
              sortable: true,
              render: (r) => (
                <Link
                  to={`/references/${r.mission_id}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <div style={{ fontWeight: 500 }}>{r.company_name}</div>
                  <div style={{ fontSize: 12, color: "var(--ds-ink-soft)" }}>{r.mission_name}</div>
                </Link>
              ),
            },
            {
              key: "skill",
              header: "Skill",
              render: (r) => r.skill_name,
            },
            {
              key: "role",
              header: "Role",
              render: (r) => (
                <span style={{ fontSize: 13, color: "var(--ds-ink-soft)" }}>
                  {r.role_description ?? "—"}
                </span>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
