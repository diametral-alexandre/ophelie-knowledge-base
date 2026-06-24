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
import type { Employee } from "../lib/types";
import { PersonHead } from "../lib/resourceUi";

export default function Consultants() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api<Employee[]>("/api/employees")
      .then(setEmployees)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return employees;
    return employees.filter((c) =>
      [c.first_name, c.last_name, c.email, c.department ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [q, employees]);

  const initials = (e: Employee) =>
    `${e.first_name[0]}${e.last_name[0]}`.toUpperCase();
  const fullName = (e: Employee) => `${e.first_name} ${e.last_name}`;

  return (
    <>
      <PageHeader
        title="Consultants"
        subtitle="The firm's directory — department, email and hire date for every profile."
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Input
            placeholder="Search name, department, email…"
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

      {loading ? (
        <EmptyState title="Loading…" description="Fetching consultants from the server." />
      ) : error ? (
        <EmptyState title="Could not load consultants" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No matches"
          description="No consultant matches that search. Try a broader term."
        />
      ) : (
        <DataGrid<Employee>
          rows={rows}
          rowKey={(c) => c.employee_id}
          pageSize={rows.length}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (c) => (
                <Link
                  to={`/consultants/${c.employee_id}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <PersonHead
                    initials={initials(c)}
                    name={fullName(c)}
                    sub={c.department ?? undefined}
                  />
                </Link>
              ),
            },
            {
              key: "email",
              header: "Email",
              render: (c) => c.email,
            },
            {
              key: "department",
              header: "Department",
              sortable: true,
              render: (c) => c.department ?? "—",
            },
            {
              key: "hire_date",
              header: "Hire Date",
              sortable: true,
              render: (c) => c.hire_date ?? "—",
            },
          ]}
        />
      )}
    </>
  );
}
