"use client";

import { IconChevron, IconTrash } from "@/components/icons/ListenerIcons";
import { formatShortDate } from "@/lib/format-date";
import { runStatusBadge } from "@/lib/ideas/run-expiry";
import { ui } from "@/lib/design/ui";
import type { IdeaRunSummary } from "@/types/ideas";
import Link from "next/link";
import { useState } from "react";

type RunHistoryProps = {
  runs: IdeaRunSummary[];
  recordingId: string;
  selectedRunId?: string | null;
  onRequestDeleteRun?: (run: IdeaRunSummary) => void;
};

const RunHistory = ({
  runs,
  recordingId,
  selectedRunId,
  onRequestDeleteRun,
}: RunHistoryProps) => {
  const [expanded, setExpanded] = useState(true);

  if (runs.length <= 1) return null;

  return (
    <div className={`${ui.cardFlat} overflow-hidden`}>
      <button
        type="button"
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-[18px] py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={ui.eyebrow}>Run history</span>
        <span className="text-xs text-muted">
          {runs.length} run{runs.length === 1 ? "" : "s"}
        </span>
        <IconChevron
          size={18}
          className={`ml-auto shrink-0 text-muted transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <ul className="border-t border-border">
            {runs.map((run) => {
              const badge = runStatusBadge(run.status);
              const selected = run.id === selectedRunId;
              const canDelete =
                run.status === "done" || run.status === "failed";
              return (
                <li
                  key={run.id}
                  className="flex items-center border-b border-border last:border-b-0"
                >
                  <Link
                    href={`/ideas/${recordingId}?run=${run.id}`}
                    aria-current={selected ? "true" : undefined}
                    className={`flex flex-1 items-center gap-3 px-[18px] py-4 text-sm transition hover:bg-black/2 ${
                      selected ? "bg-gold-10" : ""
                    }`}
                  >
                    <span className="text-text">
                      {formatShortDate(run.createdAt)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </Link>
                  {onRequestDeleteRun && canDelete ? (
                    <button
                      type="button"
                      aria-label={`Delete run from ${formatShortDate(run.createdAt)}`}
                      onClick={() => onRequestDeleteRun(run)}
                      className="mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/4 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--gold-30)"
                    >
                      <IconTrash size={15} />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RunHistory;
