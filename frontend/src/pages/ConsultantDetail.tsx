import { useMemo } from "react";
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

import {
  getConsultant,
  referencesForConsultant,
  clientsByIndustryForConsultant,
  sortReferences,
  isOngoing,
} from "../data";
import { Section, StatusTag, ChipRow } from "../lib/resourceUi";

export default function ConsultantDetail() {
  const { id = "" } = useParams();
  const c = getConsultant(id);

  const refs = useMemo(
    () => (c ? sortReferences(referencesForConsultant(c.id)) : []),
    [c]
  );
  const clientGroups = useMemo(
    () => (c ? clientsByIndustryForConsultant(c.id) : []),
    [c]
  );
  // Read-mode skills are the union of declared skills + evidence from references.
  const techStack = useMemo(
    () =>
      c
        ? Array.from(
            new Set([...c.skills, ...refs.flatMap((r) => r.skills)])
          ).sort((a, b) => a.localeCompare(b))
        : [],
    [c, refs]
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
          <Link to="/consultants" style={{ color: "var(--ds-ink-soft)", textDecoration: "none" }}>
            ← Consultants
          </Link>
        }
        actions={<StatusTag status={c.status} detail={c.statusDetail} />}
      />

      <div style={{ display: "grid", gap: 16 }}>
        {/* Identity + bio */}
        <Card>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <Avatar initials={c.initials} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                <span style={{ fontSize: 16, fontWeight: 500 }}>{c.title}</span>
                <span style={{ fontSize: 12, color: "var(--ds-ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {c.grade}
                </span>
                <span style={{ fontSize: 12, color: "var(--ds-ink-faint)" }}>
                  {c.yearsExp} yrs exp · {c.yearsAtFirm} at firm
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--ds-ink-soft)", marginTop: 6 }}>
                {c.location}
                <span style={{ color: "var(--ds-ink-faint)" }}> · {c.mobility}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ds-ink-faint)", marginTop: 4 }}>
                {c.email} · {c.rate}
              </div>
            </div>
          </div>
          {c.bio && (
            <p
              style={{
                margin: "16px 0 0",
                paddingTop: 16,
                borderTop: "1px solid var(--ds-border)",
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

        {/* References */}
        <Section title="References" aside={refs.length}>
          {refs.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ds-ink-faint)" }}>
              No references recorded yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {refs.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr",
                    gap: 18,
                    padding: "16px 0",
                    borderBottom:
                      i < refs.length - 1 ? "1px solid var(--ds-border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {isOngoing(r.duration) ? (
                      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ds-accent, var(--ds-ink))" }}>
                        ● Ongoing
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--ds-ink-soft)" }}>{r.duration}</span>
                    )}
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ds-ink-faint)" }}>
                      {r.industry}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--ds-ink-soft)" }}>{r.client}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Link
                      to={`/references/${r.id}`}
                      style={{ fontSize: 14, fontWeight: 500, color: "var(--ds-ink)", textDecoration: "none" }}
                    >
                      {r.name}
                    </Link>
                    <div style={{ fontSize: 12, color: "var(--ds-ink-faint)", marginTop: 4 }}>
                      {r.role} · team {r.team} · {r.size}
                    </div>
                    {r.outcomes.length > 0 && (
                      <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                        {r.outcomes.map((o) => (
                          <li key={o} style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ds-ink-soft)" }}>
                            {o}
                          </li>
                        ))}
                      </ul>
                    )}
                    {r.skills.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <ChipRow items={r.skills} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Skills */}
        <Section title="Skills">
          {techStack.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {techStack.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--ds-ink-faint)" }}>No skills listed.</div>
          )}
        </Section>

        {/* Clients by industry */}
        {clientGroups.length > 0 && (
          <Section title="Clients served">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {clientGroups.map((g) => (
                <div key={g.industry}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ds-ink-faint)", marginBottom: 8 }}>
                    {g.industry} ({g.clients.length})
                  </div>
                  <ChipRow items={g.clients} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {c.education.length > 0 && (
          <Section title="Education">
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {c.education.map((e, i) => (
                <li
                  key={e}
                  style={{
                    fontSize: 13.5,
                    padding: "10px 0",
                    borderBottom:
                      i < c.education.length - 1 ? "1px solid var(--ds-border)" : "none",
                  }}
                >
                  {e}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Credentials: certifications + languages */}
        <Section title="Credentials">
          <DescriptionList
            items={[
              {
                term: "Certifications",
                desc: c.certifications.length ? <ChipRow items={c.certifications} /> : "—",
              },
              {
                term: "Languages",
                desc: c.languages.length ? c.languages.join(" · ") : "—",
              },
            ]}
          />
        </Section>
      </div>
    </>
  );
}
