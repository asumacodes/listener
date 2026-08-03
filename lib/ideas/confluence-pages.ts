// lib/ideas/confluence-pages.ts
// Display helpers for Confluence pagesCreated — no React.

export type ConfluencePageDisplay = {
  index: string | null;
  name: string;
  kind: string;
};

const KIND_RULES: { match: RegExp; kind: string }[] = [
  { match: /\bprd\b|product\s*requirements|^product\b/i, kind: "PRD" },
  { match: /\bbrand\b|identity/i, kind: "Brand" },
  { match: /\bengineering\b|brief\b/i, kind: "Engineering" },
  { match: /\bcompetitor/i, kind: "Competitors" },
  { match: /\broadmap\b|phased\s+delivery/i, kind: "Roadmap" },
  { match: /\bresearch\b|notes\b/i, kind: "Notes" },
  { match: /\boverview\b|home\b/i, kind: "Overview" },
];

/** Strip leading "01 - " / "05 — " numbering Bridge often prefixes. */
export const formatConfluencePageTitle = (
  title: string | undefined | null
): ConfluencePageDisplay => {
  const raw = (title ?? "").trim() || "Untitled page";
  const numbered = raw.match(/^(\d{1,2})\s*[-–—.:]\s*(.+)$/);
  const index = numbered ? numbered[1].padStart(2, "0") : null;
  const name = numbered ? numbered[2].trim() : raw;
  const kind =
    KIND_RULES.find((r) => r.match.test(name) || r.match.test(raw))?.kind ??
    "Page";
  return { index, name, kind };
};
