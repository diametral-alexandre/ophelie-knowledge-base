import type { ReactNode, HTMLAttributes } from "react";
import { Tag, Card, Avatar, Chip } from "@diametral/design-system/react";
import type { ConsultantStatus } from "../data/types";

// Shared UI atoms for the Library screens. The point of this module is that the
// list cells and the detail headers agree on how a consultant status looks, and
// that every "section" on a detail page is the same Diametral Card shell.

type TagStatus = "info" | "success" | "warning" | "danger";

const STATUS_TONE: Record<ConsultantStatus, TagStatus> = {
  available: "success",
  "rolling-off": "warning",
  staffed: "info",
  unavailable: "danger",
};

const STATUS_LABEL: Record<ConsultantStatus, string> = {
  available: "Available",
  "rolling-off": "Rolling off",
  staffed: "Staffed",
  unavailable: "Unavailable",
};

export function StatusTag({
  status,
  detail,
}: {
  status: ConsultantStatus;
  detail?: string;
}) {
  return (
    <Tag status={STATUS_TONE[status]}>
      {STATUS_LABEL[status]}
      {detail ? ` · ${detail}` : ""}
    </Tag>
  );
}

// A titled section card. `aside` sits on the right of the header row (e.g. a
// count), `children` is the body. Thin wrapper over Diametral's <Card> so the
// detail pages read as a column of sections.
export function Section({
  title,
  aside,
  children,
  ...rest
}: {
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <Card {...rest}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ds-ink-soft)",
          }}
        >
          {title}
        </h3>
        {aside != null && (
          <span style={{ fontSize: 12, color: "var(--ds-ink-faint)" }}>{aside}</span>
        )}
      </div>
      {children}
    </Card>
  );
}

const AVATAR_SIZE: Record<string, number> = { sm: 24, lg: 48 };
const DEFAULT_AVATAR_PX = 32;

// Identity block reused on the consultant header and in list cells.
export function PersonHead({
  initials,
  name,
  sub,
  size,
  src,
}: {
  initials: string;
  name: ReactNode;
  sub?: ReactNode;
  size?: "sm" | "lg";
  src?: string;
}) {
  const px = size ? AVATAR_SIZE[size] : DEFAULT_AVATAR_PX;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {src ? (
        <img
          src={src}
          alt={typeof name === "string" ? name : initials}
          style={{ width: px, height: px, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <Avatar initials={initials} size={size} />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 500 }}>{name}</div>
        {sub != null && (
          <div style={{ fontSize: 12, color: "var(--ds-ink-soft)" }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

// A wrapping row of small chips — skills, certs, etc.
export function ChipRow({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((it) => (
        <Chip key={it}>{it}</Chip>
      ))}
    </div>
  );
}
