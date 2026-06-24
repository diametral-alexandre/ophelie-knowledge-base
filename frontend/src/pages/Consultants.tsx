import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PageHeader,
  Card,
  Input,
  DataGrid,
  EmptyState,
} from "@diametral/design-system/react";

import { CONSULTANTS } from "../data";
import type { Consultant } from "../data/types";
import { PersonHead, StatusTag } from "../lib/resourceUi";

// The consultant directory — one row per consultant, client-side search across
// name, headline, skills and location. Clicking the name opens the detail.
export default function Consultants() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CONSULTANTS;
    return CONSULTANTS.filter((c) =>
      [c.name, c.title, c.location, c.grade, ...c.skills, ...c.industries]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [q]);

  return (
    <>
      <PageHeader
        title="Consultants"
        subtitle="The firm's directory — grade, availability and the skills behind every profile."
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Input
            placeholder="Search name, skill, location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 360 }}
            aria-label="Search consultants"
          />
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ds-ink-faint)" }}>
            {rows.length} consultant{rows.length === 1 ? "" : "s"}
          </span>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No matches"
          description="No consultant matches that search. Try a broader term."
        />
      ) : (
        <DataGrid<Consultant>
          rows={rows}
          rowKey={(c) => c.id}
          pageSize={rows.length}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (c) => (
                <Link
                  to={`/consultants/${c.id}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <PersonHead initials={c.initials} name={c.name} sub={c.title} />
                </Link>
              ),
            },
            {
              key: "grade",
              header: "Grade",
              sortable: true,
              render: (c) => c.grade,
            },
            {
              key: "location",
              header: "Location",
              sortable: true,
              render: (c) => c.location,
            },
            {
              key: "status",
              header: "Status",
              render: (c) => <StatusTag status={c.status} detail={c.statusDetail} />,
            },
          ]}
        />
      )}
    </>
  );
}
