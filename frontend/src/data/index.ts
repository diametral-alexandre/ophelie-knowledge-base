import { CONSULTANTS } from "./consultants";
import { REFERENCES } from "./references";
import type { Client, Consultant, Reference } from "./types";

export type { Consultant, Reference, Client } from "./types";
export type { ConsultantStatus, Grade, PastExperience } from "./types";
export { CONSULTANTS } from "./consultants";
export { REFERENCES } from "./references";

// "BNP Paribas" → "cl-bnp-paribas". Stable id derived from the client name so a
// reference's `client` string and the Client resource always agree — the same
// slugging ophelieV2's backend used.
export function clientSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `cl-${slug}`;
}

// Clients are not stored — they are derived from the references, deduped by
// name, first-seen industry winning. Mirrors `clientsFromMissions`.
export const CLIENTS: Client[] = (() => {
  const byName = new Map<string, Client>();
  for (const r of REFERENCES) {
    if (byName.has(r.client)) continue;
    byName.set(r.client, {
      id: clientSlug(r.client),
      name: r.client,
      industry: r.industry,
    });
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
})();

// ── Single-record lookups ────────────────────────────────────────────────
export function getConsultant(id: string): Consultant | undefined {
  return CONSULTANTS.find((c) => c.id === id);
}

export function getReference(id: string): Reference | undefined {
  return REFERENCES.find((r) => r.id === id);
}

// Accepts either the slug ("cl-axa") or the raw client name ("AXA").
export function getClient(idOrName: string): Client | undefined {
  return CLIENTS.find(
    (c) => c.id === idOrName || c.name === idOrName || c.id === clientSlug(idOrName)
  );
}

// ── Relation walks ───────────────────────────────────────────────────────
export function referencesForConsultant(id: string): Reference[] {
  return REFERENCES.filter((r) => r.consultants.includes(id));
}

export function consultantsForReference(refId: string): Consultant[] {
  const ref = getReference(refId);
  if (!ref) return [];
  return ref.consultants
    .map(getConsultant)
    .filter((c): c is Consultant => Boolean(c));
}

export function referencesForClient(clientIdOrName: string): Reference[] {
  const client = getClient(clientIdOrName);
  if (!client) return [];
  return REFERENCES.filter((r) => r.client === client.name);
}

// Clients a consultant has served, grouped by industry — derived from the
// references they delivered. Used by the consultant detail "Clients" card.
export interface ClientGroup {
  industry: string;
  clients: string[];
}

export function clientsByIndustryForConsultant(id: string): ClientGroup[] {
  const byIndustry = new Map<string, Set<string>>();
  for (const r of referencesForConsultant(id)) {
    const set = byIndustry.get(r.industry) ?? new Set<string>();
    set.add(r.client);
    byIndustry.set(r.industry, set);
  }
  return Array.from(byIndustry.entries())
    .map(([industry, clients]) => ({
      industry,
      clients: Array.from(clients).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => b.clients.length - a.clients.length);
}

// Human-readable durations ("Apr 2024 – present"). Sort ongoing-first, then by
// most-recent end date — matches the consultant detail reference ordering.
function parseDuration(s: string): { endMs: number; ongoing: boolean } {
  const lower = s.toLowerCase();
  if (lower.includes("present") || lower.includes("now") || lower.includes("ongoing")) {
    return { endMs: Number.POSITIVE_INFINITY, ongoing: true };
  }
  const parts = s.split(/[–-]/);
  const tail = parts[parts.length - 1]?.trim() ?? "";
  const parsed = Date.parse(tail);
  return { endMs: Number.isNaN(parsed) ? 0 : parsed, ongoing: false };
}

export function isOngoing(duration: string): boolean {
  return parseDuration(duration).ongoing;
}

export function sortReferences(refs: Reference[]): Reference[] {
  return refs.slice().sort((a, b) => {
    const pa = parseDuration(a.duration);
    const pb = parseDuration(b.duration);
    if (pa.ongoing && !pb.ongoing) return -1;
    if (!pa.ongoing && pb.ongoing) return 1;
    return pb.endMs - pa.endMs;
  });
}
