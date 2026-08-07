"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import { PaneAction } from "@/components/desktop/reading-panes/PaneAction";
import { copyText } from "@/lib/desktop/clipboard";
import { agentText } from "@/lib/ideas/agent-text";
import { M1_CARDS } from "@/lib/ideas/cards";
import {
  canDownloadDoc,
  downloadCardDoc,
  getCardDocMarkdown,
} from "@/lib/ideas/document-download";
import type { CompetitorEntry, RunResults } from "@/types/run-results";
import { useMemo, useState } from "react";

type SortKey = "overlap" | "pricing" | "name";

type CompetitorMapPaneProps = {
  results: RunResults | null;
  streaming?: boolean;
};

type OverlapTier = "High" | "Medium" | "Low";

type OverlapDisplay =
  | { kind: "tier"; tier: OverlapTier; pct: number }
  | { kind: "text"; text: string }
  | { kind: "empty" };

const TIER_PCT: Record<OverlapTier, number> = {
  High: 92,
  Medium: 58,
  Low: 28,
};

/**
 * Infer High/Medium/Low from agent copy when explicit, else fall back to raw text.
 * `value` is unknown-ish at runtime — Bridge JSON is cast, not validated.
 */
const resolveOverlap = (value: unknown): OverlapDisplay => {
  const raw = agentText(value);
  if (!raw) return { kind: "empty" };
  const v = raw.toLowerCase();

  // Explicit tier tokens first (word boundary).
  if (/\bhigh\b/.test(v) || /^high\b/.test(v)) {
    return { kind: "tier", tier: "High", pct: TIER_PCT.High };
  }
  if (/\bmedium\b/.test(v) || /\bmed\b/.test(v) || /^med(ium)?\b/.test(v)) {
    return { kind: "tier", tier: "Medium", pct: TIER_PCT.Medium };
  }
  if (/\blow\b/.test(v) || /^low\b/.test(v)) {
    return { kind: "tier", tier: "Low", pct: TIER_PCT.Low };
  }

  // Soft synonyms when the agent describes intensity instead of a tier label.
  if (
    /\b(strong|significant|direct|substantial|very close|near[- ]identical)\b/.test(
      v
    )
  ) {
    return { kind: "tier", tier: "High", pct: TIER_PCT.High };
  }
  if (/\b(moderate|partial|some|limited overlap|adjacent)\b/.test(v)) {
    return { kind: "tier", tier: "Medium", pct: TIER_PCT.Medium };
  }
  if (/\b(weak|tangential|indirect|minimal|little|none|no overlap)\b/.test(v)) {
    return { kind: "tier", tier: "Low", pct: TIER_PCT.Low };
  }

  // Can't calculate — show the blurb like Positioning / Pricing.
  return { kind: "text", text: raw };
};

const overlapRank = (value: unknown): number => {
  const resolved = resolveOverlap(value);
  if (resolved.kind !== "tier") return 0;
  if (resolved.tier === "High") return 3;
  if (resolved.tier === "Medium") return 2;
  return 1;
};

const CompetitorMapPane = ({
  results,
  streaming = false,
}: CompetitorMapPaneProps) => {
  const [sort, setSort] = useState<SortKey>("overlap");
  const [copied, setCopied] = useState(false);
  const competitors = useMemo(
    () => results?.competitors?.competitors ?? [],
    [results?.competitors?.competitors]
  );
  const gap = agentText(
    results?.competitors?.differentiationOpportunities?.[0] ??
      results?.competitors?.ourPositioning ??
      results?.competitors?.marketSummary
  );

  const sorted = useMemo(() => {
    const rows = [...competitors];
    if (sort === "name") {
      rows.sort((a, b) => agentText(a.name).localeCompare(agentText(b.name)));
    } else if (sort === "pricing") {
      rows.sort((a, b) =>
        agentText(a.pricingModel).localeCompare(agentText(b.pricingModel))
      );
    } else {
      rows.sort(
        (a, b) => overlapRank(b.directOverlap) - overlapRank(a.directOverlap)
      );
    }
    return rows;
  }, [competitors, sort]);

  const onDownload = () => {
    if (!results || !canDownloadDoc("competitor", results)) return;
    downloadCardDoc("competitor", results);
  };

  const onCopy = async () => {
    if (!results) return;
    const md = getCardDocMarkdown("competitor", results);
    if (!md) return;
    const ok = await copyText(md);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <ReadingPane
      variant="wide"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 02 · ${M1_CARDS.competitor.title}`}
      title={M1_CARDS.competitor.title}
      actions={
        <>
          <PaneAction
            disabled={!canDownloadDoc("competitor", results)}
            onClick={onDownload}
          >
            ↓ Download .md
          </PaneAction>
          <PaneAction
            disabled={!canDownloadDoc("competitor", results)}
            onClick={() => void onCopy()}
          >
            {copied ? "Copied" : "Copy"}
          </PaneAction>
        </>
      }
    >
      {!competitors.length ? (
        <p className="text-sm text-muted">
          Competitor map isn&apos;t available.
        </p>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium tracking-[0.1em] text-muted uppercase">
            <span>{competitors.length} products</span>
            <span aria-hidden>|</span>
            {(["overlap", "pricing", "name"] as SortKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={`rounded-full px-3 py-1 transition ${
                  sort === key
                    ? "bg-gold-10 text-gold-deep"
                    : "text-muted hover:text-text"
                }`}
              >
                {key === "overlap"
                  ? "Overlap ↓"
                  : key === "pricing"
                    ? "Pricing"
                    : "Name"}
              </button>
            ))}
            <span className="ml-auto normal-case tracking-normal text-muted">
              Sorted by{" "}
              {sort === "overlap"
                ? "overlap with your idea"
                : sort === "pricing"
                  ? "pricing model"
                  : "name"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Positioning</th>
                  <th className="pb-3 pr-4 font-medium">Pricing model</th>
                  <th className="w-[120px] pb-3 font-medium">Overlap</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <CompetitorRow
                    key={`${agentText(row.name) || "c"}-${i}`}
                    row={row}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {gap ? (
            <div className="rounded-2xl border border-border bg-canvas px-5 py-4">
              <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
                Where the gap is
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-text">
                {gap}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </ReadingPane>
  );
};

const CompetitorRow = ({ row }: { row: CompetitorEntry }) => {
  const name = agentText(row.name) || "Unnamed";
  const positioning = agentText(row.positioning);
  const pricing = agentText(row.pricingModel);

  return (
    <tr className="border-b border-border align-top">
      <td className="py-4 pr-4">
        <p className="text-[14px] font-medium text-text">{name}</p>
      </td>
      <td className="py-4 pr-4">
        {positioning ? (
          <p className="text-[13px] leading-relaxed text-text-secondary">
            {positioning}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(row.strengths ?? []).slice(0, 3).map((s, i) => {
            const label = agentText(s);
            if (!label) return null;
            return (
              <span
                key={`s-${i}-${label}`}
                className="rounded-full bg-success-surface px-2 py-0.5 text-[10px] text-success-text"
              >
                {label}
              </span>
            );
          })}
          {(row.weaknesses ?? []).slice(0, 3).map((w, i) => {
            const label = agentText(w);
            if (!label) return null;
            return (
              <span
                key={`w-${i}-${label}`}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted"
              >
                {label}
              </span>
            );
          })}
        </div>
      </td>
      <td className="py-4 pr-4 text-[13px] leading-relaxed text-text-secondary">
        {pricing || "—"}
      </td>
      <td className="min-w-[140px] max-w-[200px] py-4">
        <OverlapCell value={row.directOverlap} />
      </td>
    </tr>
  );
};

const OverlapCell = ({ value }: { value: unknown }) => {
  const resolved = resolveOverlap(value);

  if (resolved.kind === "tier") {
    return (
      <>
        <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-gold-15">
          <div
            className="h-full rounded-full bg-gold"
            style={{ width: `${resolved.pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] font-medium tracking-[0.12em] text-muted uppercase">
          {resolved.tier}
        </p>
      </>
    );
  }

  if (resolved.kind === "text") {
    return (
      <p className="text-[13px] leading-relaxed text-text-secondary">
        {resolved.text}
      </p>
    );
  }

  return <p className="text-[13px] text-muted">—</p>;
};

export default CompetitorMapPane;
