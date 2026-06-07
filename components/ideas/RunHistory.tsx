"use client";

import { IconChevron } from "@/components/icons/ListenerIcons";
import type { IdeaRunSummary } from "@/types/ideas";
import Link from "next/link";
import { useState } from "react";

const formatRunDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const runBadge = (status: IdeaRunSummary["status"]) => {
  if (status === "done")
    return { label: "Done", cls: "text-success-text bg-success-surface" };
  if (status === "failed")
    return { label: "Failed", cls: "text-red bg-error-surface" };
  if (status === "running" || status === "queued") {
    return { label: "Running", cls: "text-gold bg-[var(--gold-10)]" };
  }
  return { label: status, cls: "text-muted bg-canvas" };
};

type RunHistoryProps = {
  runs: IdeaRunSummary[];
  recordingId: string;
};

const RunHistory = ({ runs, recordingId }: RunHistoryProps) => {
  const [expanded, setExpanded] = useState(false);

  if (runs.length <= 1) return null;

  return (
    <div className="run-history mt-6 rounded-2xl border border-border bg-surface">
      <button
        type="button"
        className="rh-head flex w-full items-center gap-2 px-4 py-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="type-eyebrow flex-1">Run history</span>
        <span className="text-xs text-muted">
          {runs.length} run{runs.length === 1 ? "" : "s"}
        </span>
        <IconChevron
          size={18}
          className={`text-muted transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded ? (
        <ul className="rh-list border-t border-border">
          {runs.map((run) => {
            const badge = runBadge(run.status);
            return (
              <li key={run.id}>
                <Link
                  href={`/ideas/${recordingId}?run=${run.id}`}
                  className="rh-row flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-black/[0.02]"
                >
                  <span className="text-text-secondary">
                    {formatRunDate(run.createdAt)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default RunHistory;
