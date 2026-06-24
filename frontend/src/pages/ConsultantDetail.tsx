import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PageHeader,
  Card,
  EmptyState,
  Button,
} from "@diametral/design-system/react";

import { api } from "../lib/api";
import type { Employee } from "../lib/types";
import { PersonHead } from "../lib/resourceUi";

export default function ConsultantDetail() {
  const { id = "" } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api<Employee>(`/api/employees/${id}`)
      .then(setEmployee)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const backLink = (
    <Link to="/consultants" style={{ color: "var(--ds-ink-soft)", textDecoration: "none" }}>
      ← Consultants
    </Link>
  );

  if (loading) {
    return (
      <>
        <PageHeader title="Loading…" breadcrumb={backLink} />
        <EmptyState title="Loading…" description="Fetching consultant profile." />
      </>
    );
  }

  if (error || !employee) {
    return (
      <>
        <PageHeader title="Consultant not found" breadcrumb={backLink} />
        <EmptyState
          title="No such consultant"
          description={error ?? "This profile doesn't exist or has been removed."}
          actions={
            <Link to="/consultants">
              <Button>Back to directory</Button>
            </Link>
          }
        />
      </>
    );
  }

  const fullName = `${employee.first_name} ${employee.last_name}`;
  const initials = `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase();

  return (
    <>
      <PageHeader
        title={fullName}
        subtitle={employee.department ?? undefined}
        breadcrumb={backLink}
      />

      <div style={{ display: "grid", gap: 16 }}>
        <Card>
          <PersonHead
            initials={initials}
            name={fullName}
            sub={employee.department ?? undefined}
            size="lg"
            src={employee.profile_image_url ?? undefined}
          />
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--ds-border)", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 13, color: "var(--ds-ink-soft)" }}>
              <span style={{ color: "var(--ds-ink-faint)", marginRight: 8 }}>Email</span>
              {employee.email}
            </div>
            <div style={{ fontSize: 13, color: "var(--ds-ink-soft)" }}>
              <span style={{ color: "var(--ds-ink-faint)", marginRight: 8 }}>Hire date</span>
              {employee.hire_date ?? "—"}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
