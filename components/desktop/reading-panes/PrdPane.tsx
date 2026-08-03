"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import { PaneAction } from "@/components/desktop/reading-panes/PaneAction";
import { copyText } from "@/lib/desktop/clipboard";
import { M1_CARDS } from "@/lib/ideas/cards";
import {
  canDownloadDoc,
  downloadCardDoc,
  getCardDocMarkdown,
} from "@/lib/ideas/document-download";
import type { RunResults } from "@/types/run-results";
import { useEffect, useRef, useState } from "react";

type PrdPaneProps = {
  results: RunResults | null;
  ideaTitle: string;
  streaming?: boolean;
};

const SECTIONS = [
  { id: "one-liner", label: "One-liner" },
  { id: "problem", label: "Problem" },
  { id: "target-user", label: "Target user" },
  { id: "must-have", label: "Must-have features" },
  { id: "success-metrics", label: "Success metrics" },
  { id: "open-questions", label: "Open questions" },
] as const;

/** Pull a leading figure (≥2000, 70%, < 8 min) — description stays on the right. */
const splitMetricFigure = (
  metric?: string,
  target?: string
): { figure: string; detail: string } => {
  const targetText = (target ?? "").trim();
  const metricText = (metric ?? "").trim();
  const source = targetText || metricText;
  if (!source) return { figure: "—", detail: "" };

  const match = source.match(
    /^([≤≥<>~≈]?\s*[\d,.]+%?(?:\s*(?:min|mins?|minutes?|hrs?|hours?|secs?|days?|wks?|mos?|x|×))?)/i
  );

  if (match) {
    const figure = match[1].replace(/\s+/g, " ").trim();
    const rest = source
      .slice(match[0].length)
      .replace(/^[\s|—–\-:]+/, "")
      .trim();
    const detail =
      rest ||
      (source === targetText && metricText && metricText !== figure
        ? metricText
        : "");
    return { figure, detail };
  }

  // Fields sometimes swapped: short target-like metric, long description in metric field.
  if (targetText && metricText) {
    const swapped = metricText.match(/^([≤≥<>~≈]?\s*[\d,.]+%?)/i);
    if (swapped && metricText.length <= 24) {
      return {
        figure: swapped[1].trim(),
        detail: targetText,
      };
    }
  }

  return {
    figure: source,
    detail: metricText && metricText !== source ? metricText : "",
  };
};

const PrdPane = ({ results, ideaTitle, streaming = false }: PrdPaneProps) => {
  const prd = results?.prd ?? null;
  const [active, setActive] = useState<string>("one-liner");
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = SECTIONS.map((s) =>
      document.getElementById(`prd-${s.id}`)
    ).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id.replace(/^prd-/, ""));
        }
      },
      {
        root: root.closest(".overflow-y-auto"),
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.4],
      }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [prd]);

  const onDownload = () => {
    if (!results || !canDownloadDoc("prd", results)) return;
    downloadCardDoc("prd", results);
  };

  const onCopy = async () => {
    if (!results) return;
    const md = getCardDocMarkdown("prd", results);
    if (!md) return;
    const ok = await copyText(md);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const jump = (id: string) => {
    document.getElementById(`prd-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActive(id);
  };

  const present = SECTIONS.filter((s) => {
    if (!prd) return false;
    if (s.id === "one-liner") return !!prd.oneLiner;
    if (s.id === "problem") return !!prd.problem;
    if (s.id === "target-user") return !!prd.targetUser;
    if (s.id === "must-have") return !!prd.features?.must_have?.length;
    if (s.id === "success-metrics") return !!prd.successMetrics?.length;
    if (s.id === "open-questions") return !!prd.openQuestions?.length;
    return false;
  });

  return (
    <ReadingPane
      variant="wide"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 03 · Product requirements`}
      title={`${M1_CARDS.prd.title}${prd?.productName ? ` — ${prd.productName}` : ""}`}
      actions={
        <>
          <PaneAction
            disabled={!canDownloadDoc("prd", results)}
            onClick={onDownload}
          >
            ↓ Download .md
          </PaneAction>
          <PaneAction
            disabled={!canDownloadDoc("prd", results)}
            onClick={() => void onCopy()}
          >
            {copied ? "Copied" : "Copy"}
          </PaneAction>
        </>
      }
    >
      {!prd ? (
        streaming ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Streaming · waiting for run_results.prd
            </p>
            <div className="h-3 w-full animate-skeleton-shimmer rounded bg-border/40" />
            <div className="h-3 w-5/6 animate-skeleton-shimmer rounded bg-border/40" />
          </div>
        ) : (
          <p className="text-sm text-muted">No PRD in run_results yet.</p>
        )
      ) : (
        <div ref={rootRef} className="flex gap-10">
          <div className="min-w-0 max-w-[620px] flex-1 space-y-10">
            {prd.oneLiner ? (
              <section id="prd-one-liner">
                <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                  One-liner
                </p>
                <p className="mt-2 font-serif text-2xl leading-snug text-text">
                  {prd.oneLiner}
                  {streaming ? (
                    <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-gold align-middle" />
                  ) : null}
                </p>
              </section>
            ) : null}

            {prd.problem ? (
              <section id="prd-problem">
                <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                  Problem
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-text-secondary">
                  {prd.problem}
                </p>
              </section>
            ) : null}

            {prd.targetUser ? (
              <section id="prd-target-user">
                <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                  Target user
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-text-secondary">
                  {prd.targetUser}
                </p>
              </section>
            ) : null}

            {prd.features?.must_have?.length ? (
              <section id="prd-must-have">
                <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                  Must-have features
                </p>
                <ol className="mt-4 space-y-6">
                  {prd.features.must_have.map((f, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="w-10 shrink-0 font-serif text-[28px] leading-none text-muted/50">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-[15px] text-text">
                          <span className="font-medium">
                            {f.title ?? "Feature"}
                          </span>
                          {f.description ? (
                            <span className="text-text-secondary">
                              {" "}
                              — {f.description}
                            </span>
                          ) : null}
                        </p>
                        {f.rationale ? (
                          <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                            {f.rationale}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {prd.successMetrics?.length ? (
              <section id="prd-success-metrics">
                <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                  Success metrics
                </p>
                <ul className="mt-4 divide-y divide-border">
                  {prd.successMetrics.map((m, i) => {
                    const { figure, detail } = splitMetricFigure(
                      m.metric,
                      m.target
                    );
                    return (
                      <li key={i} className="flex items-baseline gap-5 py-3.5">
                        <span className="w-[104px] shrink-0 font-serif text-[28px] leading-none whitespace-nowrap text-text">
                          {figure}
                        </span>
                        <span className="min-w-0 text-[14px] leading-relaxed text-text-secondary">
                          {detail}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {prd.openQuestions?.length ? (
              <section id="prd-open-questions">
                <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                  Open questions
                </p>
                <ul className="mt-4 space-y-2.5">
                  {prd.openQuestions.map((q, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-border bg-surface px-4 py-3 text-[14px] leading-relaxed text-text"
                    >
                      <span className="mr-2 text-muted">?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {streaming && !prd.features?.must_have?.length ? (
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full animate-skeleton-shimmer rounded bg-border/40" />
                <div className="h-3 w-5/6 animate-skeleton-shimmer rounded bg-border/40" />
              </div>
            ) : null}
          </div>

          <aside className="hidden w-[176px] shrink-0 xl:block">
            <div className="sticky top-0">
              <p className="mb-3 text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
                On this page
              </p>
              <nav className="flex flex-col gap-1">
                {present.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => jump(s.id)}
                    className={`border-l-2 px-3 py-1.5 text-left text-[12px] transition ${
                      active === s.id
                        ? "border-gold text-text"
                        : "border-transparent text-muted hover:text-text"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
              <p className="mt-5 text-[11px] leading-snug text-muted">
                {present.length} sections
                {ideaTitle ? ` — ${ideaTitle}` : null}
              </p>
            </div>
          </aside>
        </div>
      )}
    </ReadingPane>
  );
};

export default PrdPane;
