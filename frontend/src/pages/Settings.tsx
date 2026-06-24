import { useState } from "react";
import {
  PageHeader,
  Switch,
  DescriptionList,
  Button,
  Callout,
} from "@diametral/design-system/react";

import { keycloak } from "../lib/keycloak";
import { currentUser } from "../lib/currentUser";
import { Section } from "../lib/resourceUi";

const PREFS_KEY = "ophelie.settings.notifications.v1";

interface NotifPrefs {
  emailDigest: boolean;
  mentions: boolean;
  weeklySummary: boolean;
  staffingAlerts: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  emailDigest: true,
  mentions: true,
  weeklySummary: false,
  staffingAlerts: true,
};

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

const NOTIF_ROWS: { key: keyof NotifPrefs; label: string; hint: string }[] = [
  { key: "emailDigest", label: "Email digest", hint: "A daily summary of activity." },
  { key: "mentions", label: "Mentions", hint: "When someone mentions you." },
  { key: "weeklySummary", label: "Weekly summary", hint: "A Monday-morning recap." },
  { key: "staffingAlerts", label: "Staffing alerts", hint: "New offers matching your profile." },
];

// A lightweight settings page: appearance, notification preferences, and the
// account block. Theme (Light/Dark/Sepia) lives in the top-bar switcher; the
// notification toggles persist locally for this frontend-only MVP.
export default function Settings() {
  const me = currentUser();
  const [prefs, setPrefs] = useState<NotifPrefs>(loadPrefs);

  function toggle(key: keyof NotifPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Appearance, notifications and your account." />

      <div style={{ display: "grid", gap: 16 }}>
        <Section title="Appearance">
          <Callout type="info" heading="Theme">
            Switch between Light, Dark and Sepia using the theme control in the top
            bar — your choice is remembered across sessions.
          </Callout>
        </Section>

        <Section title="Notifications">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NOTIF_ROWS.map((row, i) => (
              <div
                key={row.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom:
                    i < NOTIF_ROWS.length - 1 ? "1px solid var(--ds-border)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 14 }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: "var(--ds-ink-faint)" }}>{row.hint}</div>
                </div>
                <Switch
                  checked={prefs[row.key]}
                  onChange={(checked) => toggle(row.key, checked)}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Account">
          <DescriptionList
            items={[
              { term: "Name", desc: me.name },
              { term: "Email", desc: me.email },
              { term: "Roles", desc: me.roles.join(", ") || "—" },
            ]}
          />
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => keycloak.logout({ redirectUri: window.location.origin })}>
              Sign out
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
