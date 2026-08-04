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
          Engineering brief isn&apos;t available.
        </p>
      ) : (
        <div className="max-w-[720px] space-y-10">
          {eng?.hld?.overview ? (
            <section>
              <p className="font-serif text-[13px] tracking-[0.16em] text-gold uppercase">
                Overview
              </p>
              <p className="mt-2.5 whitespace-pre-wrap text-[16px] leading-relaxed text-text-secondary">
                {eng.hld.overview}
              </p>
            </section>
          ) : null}

          {stack.length ? (
            <section>
              <p className="font-serif text-[13px] tracking-[0.16em] text-gold uppercase">
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
                    <p className="text-[12px] font-medium tracking-[0.14em] text-muted uppercase">
                      {key}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-snug text-text">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {milestones.length ? (
            <section>
              <p className="font-serif text-[13px] tracking-[0.16em] text-gold uppercase">
                First milestones
              </p>
              <ol className="mt-5">
                {milestones.map((task, i) => {
                  const isLast = i === milestones.length - 1;
                  return (
                    <li key={i} className="flex gap-4">
                      {/*
                        Rail is text-[19px] so em math matches the title line-box.
                        Top stub = (line-height − dot) / 2 → dot sits on the title midline.
                        Line + dots share the column center via items-center.
                      */}
                      <div
                        className="flex w-3 shrink-0 flex-col items-center self-stretch text-[19px] leading-snug"
                        aria-hidden
                      >
                        <div
                          className={`w-px shrink-0 ${
                            i === 0 ? "bg-transparent" : "bg-border"
                          } h-[calc((1.375em-0.625rem)/2)]`}
                        />
                        <span className="size-2.5 shrink-0 rounded-full bg-gold" />
                        <div
                          className={`w-px min-h-[1.25rem] flex-1 ${
                            isLast ? "bg-transparent" : "bg-border"
                          }`}
                        />
                      </div>
                      <div className={`min-w-0 ${isLast ? "pb-0" : "pb-7"}`}>
                        <p className="text-[19px] font-medium leading-snug text-text">
                          {task.title ?? `Milestone ${i + 1}`}
                        </p>
                        {task.description ? (
                          <p className="mt-1.5 text-[14px] leading-relaxed text-text-secondary">
                            {task.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
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
