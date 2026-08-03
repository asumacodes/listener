"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import { PaneAction } from "@/components/desktop/reading-panes/PaneAction";
import { copyText } from "@/lib/desktop/clipboard";
import { M1_CARDS } from "@/lib/ideas/cards";
import {
  canDownloadDoc,
  downloadCardDoc,
  formatTechStackMarkdown,
  getCardDocMarkdown,
} from "@/lib/ideas/document-download";
import type { RunResults } from "@/types/run-results";
import { useState } from "react";

type EngineeringBriefPaneProps = {
  results: RunResults | null;
  streaming?: boolean;
};

const EngineeringBriefPane = ({
  results,
  streaming = false,
}: EngineeringBriefPaneProps) => {
  const eng = results?.engineering ?? null;
  const stack = eng?.techStack ? Object.entries(eng.techStack) : [];
  const milestones = eng?.engineeringTasks ?? [];
  const [copiedStack, setCopiedStack] = useState(false);

  const hasContent =
    !!eng && (!!eng.hld?.overview || stack.length > 0 || milestones.length > 0);

  const onDownload = () => {
    if (!results || !canDownloadDoc("engineering", results)) return;
    downloadCardDoc("engineering", results);
  };

  const onCopyStack = async () => {
    const md = formatTechStackMarkdown(eng?.techStack);
    if (!md) return;
    const ok = await copyText(md);
    if (ok) {
      setCopiedStack(true);
      window.setTimeout(() => setCopiedStack(false), 1600);
    }
  };

  return (
    <ReadingPane
      variant="wide"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 05 · ${M1_CARDS.engineering.title}`}
      title={M1_CARDS.engineering.title}
      actions={
        <>
          <PaneAction
            disabled={!canDownloadDoc("engineering", results)}
            onClick={onDownload}
          >
            ↓ Download .md
          </PaneAction>
          <PaneAction
            disabled={!stack.length}
            onClick={() => void onCopyStack()}
          >
            {copiedStack ? "Copied" : "Copy stack"}
          </PaneAction>
        </>
      }
    >
      {!hasContent ? (
        <p className="text-sm text-muted">
          No engineering brief in run_results yet.
        </p>
      ) : (
        <div className="max-w-[720px] space-y-10">
          {eng?.hld?.overview ? (
            <section>
              <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                Overview
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-text-secondary">
                {eng.hld.overview}
              </p>
            </section>
          ) : null}

          {stack.length ? (
            <section>
              <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                Stack
              </p>
              <div className="mt-4 grid grid-cols-1 border border-border sm:grid-cols-2 lg:grid-cols-3">
                {stack.map(([key, value], i) => (
                  <div
                    key={key}
                    className={`px-4 py-3.5 ${
                      i % 3 !== 2 ? "lg:border-r lg:border-border" : ""
                    } ${i < stack.length - (stack.length % 3 || 3) ? "border-b border-border" : ""} sm:border-b sm:border-border`}
                  >
                    <p className="text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
                      {key}
                    </p>
                    <p className="mt-1.5 text-[14px] text-text">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {milestones.length ? (
            <section>
              <p className="font-serif text-[11px] tracking-[0.16em] text-gold uppercase">
                First milestones
              </p>
              <ol className="relative mt-5 space-y-6 border-l border-border pl-6">
                {milestones.map((task, i) => (
                  <li key={i} className="relative">
                    <span
                      className="absolute top-1.5 -left-[31px] h-2.5 w-2.5 rounded-full bg-gold"
                      aria-hidden
                    />
                    <p className="text-[15px] font-medium text-text">
                      {task.title ?? `Milestone ${i + 1}`}
                    </p>
                    {task.description ? (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
                        {task.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {/* Quiet access to full markdown copy if needed */}
          {results && getCardDocMarkdown("engineering", results) ? null : null}
        </div>
      )}
    </ReadingPane>
  );
};

export default EngineeringBriefPane;
