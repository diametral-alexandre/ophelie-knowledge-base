import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PageHeader,
  Card,
  EmptyState,
  Button,
  DescriptionList,
  Avatar,
  Chip,
} from "@diametral/design-system/react";

import { api } from "../lib/api";
import type { Employee, EmployeeReference } from "../lib/types";
import { PersonHead, Section, ChipRow } from "../lib/resourceUi";

export default function ConsultantDetail() {
  const { id = "" } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [refs, setRefs] = useState<EmployeeReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api<Employee>(`/api/employees/${id}`),
      api<EmployeeReference[]>(`/api/employees/${id}/references`),
    ])
      .then(([emp, empRefs]) => {
        setEmployee(emp);
        setRefs(empRefs);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Group reference rows by mission; collect all skills per mission.
  const missions = useMemo(() => {
    const map = new Map<number, { ref: EmployeeReference; skills: string[] }>();
    for (const r of refs) {
      if (!map.has(r.mission_id)) {
        map.set(r.mission_id, { ref: r, skills: [] });
      }
      map.get(r.mission_id)!.skills.push(r.skill_name);
    }
    return [...map.values()];
  }, [refs]);

  const backLink = (
    <Link
      to="/consultants"
      style={{ color: "var(--ds-ink-soft)", textDecoration: "none" }}
    >
      ← Consultants
    </Link>
  );

  if (!c) {
    return (
      <>
        <PageHeader title="Consultant not found" />
        <EmptyState
          title="No such consultant"
          description="This profile doesn't exist or has been removed."
          actions={
            <Link to="/consultants">
              <Button>Back to directory</Button>
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={c.name}
        subtitle={c.title}
        breadcrumb={
          <Link
            to="/consultants"
            style={{ color: "var(--ds-ink-soft)", textDecoration: "none" }}
          >
            ← Consultants
          </Link>
        }
        actions={<StatusTag status={c.status} detail={c.statusDetail} />}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <Card>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <Avatar initials={c.initials} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 500 }}>{c.title}</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--ds-ink-faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {c.grade}
                </span>
                <span style={{ fontSize: 12, color: "var(--ds-ink-faint)" }}>
                  {c.yearsExp} yrs exp · {c.yearsAtFirm} at firm
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ds-ink-soft)",
                  marginTop: 6,
                }}
              >
                {c.location}
                <span style={{ color: "var(--ds-ink-faint)" }}>
                  {" "}
                  · {c.mobility}
                </span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ds-ink-faint)",
                  marginTop: 4,
                }}
              >
                {c.email} · {c.rate}
              </div>
            </div>
          </div>
          {c.bio && (
            <p
              style={{
                margin: "16px 0 0",
                paddingTop: 16,
                borderTop: "1px solid var(--ds-rule)",
                fontSize: 14,
                lineHeight: 1.65,
                color: "var(--ds-ink-soft)",
                maxWidth: "68ch",
              }}
            >
              {c.bio}
            </p>
          )}
        </Card>

        <Section title="References" aside={missions.length}>
          {missions.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ds-ink-faint)" }}>
              No references recorded yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {missions.map(({ ref: r, skills }, i) => (
                <div
                  key={r.mission_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom:
                      i < missions.length - 1
                        ? "1px solid var(--ds-border)"
                        : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color:
                          r.status === "In Progress"
                            ? "var(--ds-accent, var(--ds-ink))"
                            : "var(--ds-ink-faint)",
                      }}
                    >
                      {r.status === "In Progress" ? "● Ongoing" : r.status}
                    </span>
                    {r.start_date && (
                      <span
                        style={{ fontSize: 12, color: "var(--ds-ink-faint)" }}
                      >
                        {r.start_date}
                        {r.end_date ? ` → ${r.end_date}` : ""}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <Link
                      to={`/references/${r.mission_id}`}
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--ds-ink)",
                        textDecoration: "none",
                      }}
                    >
                      {r.mission_name}
                    </Link>
                    {r.role_description && (
                      <div
                        style={{ fontSize: 12, color: "var(--ds-ink-faint)" }}
                      >
                        {r.role_description}
                      </div>
                    )}
                    <ChipRow items={skills} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
