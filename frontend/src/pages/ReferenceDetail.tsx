import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PageHeader,
  EmptyState,
  Button,
  DescriptionList,
} from "@diametral/design-system/react";

import { api } from "../lib/api";
import type { Client, Mission, ReferenceRow } from "../lib/types";
import { Section, ChipRow, PersonHead } from "../lib/resourceUi";

export default function ReferenceDetail() {
  const { id = "" } = useParams();
  const [mission, setMission] = useState<Mission | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [rows, setRows] = useState<ReferenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api<Mission>(`/api/missions/${id}`),
      api<ReferenceRow[]>(`/api/missions/${id}/references`),
    ])
      .then(([m, refRows]) => {
        setMission(m);
        setRows(refRows);
        return api<Client>(`/api/clients/${m.client_id}`);
      })
      .then(setClient)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const skills = useMemo(
    () => [...new Set(rows.map((r) => r.skill_name))].sort(),
    [rows],
  );

  const team = useMemo(() => {
    const map = new Map<number, { row: ReferenceRow; skills: string[] }>();
    for (const r of rows) {
      if (!r.employee_id) continue;
      if (!map.has(r.employee_id)) {
        map.set(r.employee_id, { row: r, skills: [] });
      }
      map.get(r.employee_id)!.skills.push(r.skill_name);
    }
    return [...map.values()];
  }, [rows]);

  const backLink = (
    <Link
      to="/references"
      style={{ color: "var(--ds-ink-soft)", textDecoration: "none" }}
    >
      ← References
    </Link>
  );

  if (loading) {
    return (
      <>
        <PageHeader title="Loading…" breadcrumb={backLink} />
        <EmptyState
          title="Loading…"
          description="Fetching reference details."
        />
      </>
    );
  }

  if (error || !mission) {
    return (
      <>
        <PageHeader title="Reference not found" breadcrumb={backLink} />
        <EmptyState
          title="No such reference"
          description={
            error ?? "This engagement doesn't exist or has been removed."
          }
          actions={
            <Link to="/references">
              <Button>Back to references</Button>
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={mission.mission_name}
        subtitle={mission.description ?? undefined}
        breadcrumb={backLink}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          alignItems: "start",
        }}
      >
        <Section title="Team" aside={team.length}>
          {team.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ds-ink-faint)" }}>
              No consultants linked.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {team.map(({ row: r, skills: memberSkills }, i) => (
                <div
                  key={r.employee_id}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i < team.length - 1
                        ? "1px solid var(--ds-border)"
                        : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
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
                  <ChipRow items={memberSkills} />
                </div>
              ))}
            </div>
          )}
        </Section>

        <div style={{ display: "grid", gap: 16 }}>
          <Section title="Skills">
            {skills.length > 0 ? (
              <ChipRow items={skills} />
            ) : (
              <div style={{ fontSize: 13, color: "var(--ds-ink-faint)" }}>
                No skills recorded.
              </div>
            )}
          </Section>

          <Section title="Details">
            <DescriptionList
              items={[
                { term: "Status", desc: mission.status },
                { term: "Start", desc: mission.start_date ?? "—" },
                { term: "End", desc: mission.end_date ?? "—" },
                {
                  term: "Client",
                  desc: client ? (
                    <Link
                      to={`/clients/${client.client_id}`}
                      style={{ color: "var(--ds-accent, var(--ds-ink))" }}
                    >
                      {client.company_name}
                    </Link>
                  ) : (
                    "—"
                  ),
                },
                { term: "Sector", desc: client?.sector ?? "—" },
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  );
}
