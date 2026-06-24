import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { Icon, type IconName } from "@diametral/design-system/react";

import { CONSULTANTS, REFERENCES, CLIENTS } from "../data";
import type { Consultant, Reference, Client } from "../data/types";
import { NAV_ITEMS } from "./nav";

// Inline command/search palette — a faithful port of ophelieV2's SearchPalette.
// It is NOT a modal: it's a search box docked in the topbar that drops a grouped
// results panel below. ⌘K focuses it; ↑/↓ move the cursor; ↵ opens; esc closes.

type Kind = "page" | "consultant" | "reference" | "client" | "skill";

interface Hit {
  kind: Kind;
  id: string;
  label: string;
  sub?: string;
  meta?: string;
  path: string;
  icon: IconName;
  score: number;
  match?: [number, number];
}

const MOD =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
    ? "⌘"
    : "Ctrl";

const RECENT_KEY = "ophelie.search.recent";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (!q.trim()) return;
  const cur = loadRecent().filter((x) => x.toLowerCase() !== q.toLowerCase());
  cur.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, 6)));
}

// Substring match with a boundary bonus — same scoring shape as the original.
function scoreMatch(
  haystack: string,
  needle: string
): { score: number; match?: [number, number] } {
  if (!needle) return { score: 0 };
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  const idx = h.indexOf(n);
  if (idx === -1) return { score: 0 };
  const prev = h[idx - 1] ?? "";
  const boundary = idx === 0 || /\W/.test(prev);
  return { score: 100 - idx + (boundary ? 20 : 0), match: [idx, idx + n.length] };
}

function bestOf(
  candidates: [string, number][],
  query: string
): { score: number; match?: [number, number]; source: string } {
  let best = { score: 0, match: undefined as [number, number] | undefined, source: "" };
  for (const [text, weight] of candidates) {
    const s = scoreMatch(text, query);
    const weighted = s.score * weight;
    if (weighted > best.score) best = { score: weighted, match: s.match, source: text };
  }
  return best;
}

function buildHits(
  q: string,
  consultants: Consultant[],
  references: Reference[],
  clients: Client[]
): Hit[] {
  const query = q.trim();
  const out: Hit[] = [];

  // Pages — show all when the query is empty, else filter by label/keywords.
  for (const p of NAV_ITEMS) {
    if (!query) {
      out.push({ kind: "page", id: p.path, label: p.label, sub: p.sub, path: p.path, icon: p.icon, score: 0 });
    } else {
      const s = scoreMatch(p.label, query);
      const kw = (p.keywords ?? []).reduce((m, k) => Math.max(m, scoreMatch(k, query).score), 0);
      const total = Math.max(s.score, kw);
      if (total > 0) {
        out.push({ kind: "page", id: p.path, label: p.label, sub: p.sub, path: p.path, icon: p.icon, score: total + 50, match: s.match });
      }
    }
  }

  if (!query) return out;

  for (const c of consultants) {
    const best = bestOf(
      [
        [c.name, 3],
        [c.title, 1.2],
        [c.location, 0.8],
        [c.grade, 1],
        [c.skills.join(" "), 1.5],
        [c.industries.join(" "), 1],
        [c.certifications.join(" "), 0.6],
      ],
      query
    );
    if (best.score > 0) {
      out.push({
        kind: "consultant",
        id: c.id,
        label: c.name,
        sub: `${c.grade} · ${c.title}`,
        meta: c.location,
        path: `/consultants/${c.id}`,
        icon: "users",
        score: best.score,
        match: best.source === c.name ? best.match : undefined,
      });
    }
  }

  for (const r of references) {
    const best = bestOf(
      [
        [r.name, 3],
        [r.client, 2],
        [r.industry, 1],
        [r.role, 1],
        [r.skills.join(" "), 1.5],
        [r.summary, 0.5],
      ],
      query
    );
    if (best.score > 0) {
      out.push({
        kind: "reference",
        id: r.id,
        label: r.name,
        sub: `${r.industry} · ${r.role}`,
        meta: r.duration,
        path: `/references/${r.id}`,
        icon: "folder",
        score: best.score,
        match: best.source === r.name ? best.match : undefined,
      });
    }
  }

  for (const cl of clients) {
    const best = bestOf([[cl.name, 3], [cl.industry, 1]], query);
    if (best.score > 0) {
      out.push({
        kind: "client",
        id: cl.id,
        label: cl.name,
        sub: cl.industry,
        path: `/clients/${cl.id}`,
        icon: "grid",
        score: best.score,
        match: best.source === cl.name ? best.match : undefined,
      });
    }
  }

  // Skills — surface matching skill chips with a consultant count.
  const skillCount = new Map<string, number>();
  for (const c of consultants) for (const s of c.skills) skillCount.set(s, (skillCount.get(s) ?? 0) + 1);
  for (const [skill, count] of skillCount) {
    const s = scoreMatch(skill, query);
    if (s.score > 0) {
      out.push({
        kind: "skill",
        id: `skill:${skill}`,
        label: skill,
        sub: `${count} consultant${count === 1 ? "" : "s"}`,
        path: `/consultants?skill=${encodeURIComponent(skill)}`,
        icon: "filter",
        score: s.score * 0.8,
        match: s.match,
      });
    }
  }

  return out.sort((a, b) => b.score - a.score);
}

function Highlight({ text, match }: { text: string; match?: [number, number] }) {
  if (!match) return <>{text}</>;
  const [s, e] = match;
  return (
    <>
      {text.slice(0, s)}
      <mark className="oph-hl">{text.slice(s, e)}</mark>
      {text.slice(e)}
    </>
  );
}

const ORDER: { kind: Kind; title: string }[] = [
  { kind: "page", title: "Pages" },
  { kind: "consultant", title: "Consultants" },
  { kind: "reference", title: "References" },
  { kind: "client", title: "Clients" },
  { kind: "skill", title: "Skills" },
];

const KIND_LABEL: Record<Kind, string> = {
  page: "Page",
  consultant: "Consultant",
  reference: "Reference",
  client: "Client",
  skill: "Skill",
};

export function SearchPalette({ placeholder = "Search…" }: { placeholder?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const hits = useMemo(
    () => buildHits(q, CONSULTANTS, REFERENCES, CLIENTS).slice(0, 12),
    [q]
  );

  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setCursor(0);
  }

  // ⌘K to focus, Escape to dismiss — global.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Click-away closes the panel.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const choose = useCallback(
    (hit: Hit) => {
      pushRecent(q || hit.label);
      setRecent(loadRecent());
      setOpen(false);
      setQ("");
      navigate(hit.path);
    },
    [navigate, q]
  );

  const grouped = useMemo(() => {
    const g: Record<Kind, Hit[]> = { page: [], consultant: [], reference: [], client: [], skill: [] };
    for (const h of hits) g[h.kind].push(h);
    return g;
  }, [hits]);

  const flat = ORDER.flatMap((g) => grouped[g.kind]);
  const cursorId = flat[cursor]?.id;

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(flat.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      const target = flat[cursor];
      if (target) {
        e.preventDefault();
        choose(target);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="oph-search" ref={rootRef}>
      <div className={`oph-search-box${open ? " open" : ""}`}>
        <span className="oph-search-icon">
          <Icon name="search" size={14} />
        </span>
        <input
          ref={inputRef}
          className="oph-search-input"
          placeholder={placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          aria-label="Search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {q && (
          <button
            type="button"
            className="oph-search-clear"
            title="Clear"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
          >
            <Icon name="x" size={12} />
          </button>
        )}
        <span className="oph-kbd">{MOD} K</span>
      </div>

      {open && (
        <div className="oph-search-pop" role="listbox">
          {!q.trim() && recent.length > 0 && (
            <div className="oph-sec">
              <div className="oph-sec-head">
                <Icon name="calendar" size={11} />
                <span>Recent</span>
                <button
                  type="button"
                  className="oph-sec-count"
                  style={{ background: "none", border: 0, cursor: "pointer" }}
                  onClick={() => {
                    localStorage.removeItem(RECENT_KEY);
                    setRecent([]);
                  }}
                >
                  Clear
                </button>
              </div>
              <div className="oph-recent-chips">
                {recent.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="oph-recent-chip"
                    onClick={() => {
                      setQ(r);
                      inputRef.current?.focus();
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {flat.length === 0 ? (
            <div className="oph-search-empty">
              No results for <strong>"{q}"</strong>.
            </div>
          ) : (
            ORDER.map((g) => {
              const items = grouped[g.kind];
              if (items.length === 0) return null;
              return (
                <div className="oph-sec" key={g.kind}>
                  <div className="oph-sec-head">
                    <span>{g.title}</span>
                    <span className="oph-sec-count">{items.length}</span>
                  </div>
                  {items.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      role="option"
                      aria-selected={hit.id === cursorId}
                      className={`oph-opt${hit.id === cursorId ? " active" : ""}`}
                      onMouseEnter={() => setCursor(flat.findIndex((f) => f.id === hit.id))}
                      onClick={() => choose(hit)}
                    >
                      <span className="oph-opt-icon">
                        <Icon name={hit.icon} size={14} />
                      </span>
                      <span className="oph-opt-body">
                        <span className="oph-opt-label">
                          <Highlight text={hit.label} match={hit.match} />
                        </span>
                        {hit.sub && <span className="oph-opt-sub">{hit.sub}</span>}
                      </span>
                      {hit.meta && <span className="oph-opt-meta">{hit.meta}</span>}
                      <span className="oph-opt-kind">{KIND_LABEL[hit.kind]}</span>
                    </button>
                  ))}
                </div>
              );
            })
          )}

          <div className="oph-search-foot">
            <span>
              <span className="oph-kbd">↑</span> <span className="oph-kbd">↓</span> navigate
            </span>
            <span>
              <span className="oph-kbd">↵</span> open
            </span>
            <span>
              <span className="oph-kbd">esc</span> close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
