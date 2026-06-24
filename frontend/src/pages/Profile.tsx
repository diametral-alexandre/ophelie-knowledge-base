import { useState } from "react";
import {
  PageHeader,
  Card,
  Avatar,
  Tag,
  DescriptionList,
  Textarea,
  Button,
} from "@diametral/design-system/react";

import { currentUser } from "../lib/currentUser";
import { Section } from "../lib/resourceUi";

const BIO_KEY = "ophelie.profile.bio.v1";

// The signed-in user's own profile. Identity is read from the Keycloak token
// (read-only); the short bio is the one editable field, persisted to
// localStorage for this frontend-only MVP.
export default function Profile() {
  const me = currentUser();
  const [bio, setBio] = useState(() => localStorage.getItem(BIO_KEY) ?? "");
  const [draft, setDraft] = useState(bio);
  const [editing, setEditing] = useState(false);
  const dirty = draft !== bio;

  function save() {
    localStorage.setItem(BIO_KEY, draft);
    setBio(draft);
    setEditing(false);
  }

  return (
    <>
      <PageHeader
        title="My profile"
        subtitle="Your account, as validated by Keycloak."
        actions={
          editing ? (
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={() => { setDraft(bio); setEditing(false); }}>Cancel</Button>
              <Button variant="primary" onClick={save} disabled={!dirty}>
                Save
              </Button>
            </div>
          ) : (
            <Button onClick={() => { setDraft(bio); setEditing(true); }}>Edit Profile</Button>
          )
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Avatar initials={me.initials} size="lg" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{me.name}</div>
            <div style={{ fontSize: 13, color: "var(--ds-ink-soft)", marginTop: 2 }}>{me.email}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {me.roles.length ? (
                me.roles.map((r) => (
                  <Tag key={r} status={r === "admin" ? "info" : "success"}>
                    {r}
                  </Tag>
                ))
              ) : (
                <span style={{ fontSize: 12, color: "var(--ds-ink-faint)" }}>no roles</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Section title="Account">
        <DescriptionList
          items={[
            { term: "Full name", desc: me.name },
            { term: "Username", desc: me.username },
            { term: "Email", desc: me.email },
            { term: "Roles", desc: me.roles.join(", ") || "—" },
          ]}
        />
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--ds-rule)" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ds-ink-faint)", marginBottom: 8 }}>
            Short bio
          </div>
          {editing ? (
            <Textarea
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="A line or two about yourself…"
            />
          ) : (
            <div style={{ fontSize: 14, color: "var(--ds-ink-soft)", whiteSpace: "pre-wrap" }}>
              {bio || <span style={{ color: "var(--ds-ink-faint)" }}>No bio yet.</span>}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
