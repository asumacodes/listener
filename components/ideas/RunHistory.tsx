"use client";

import DeleteRunSheet from "@/components/confirm/DeleteRunSheet";
import { IconChevron } from "@/components/icons/ListenerIcons";
import { deleteRun } from "@/lib/runs/client";
import type { IdeaRunSummary } from "@/types/ideas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ui } from "@/lib/design/ui";
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
    return { label: "Running", cls: "text-gold bg-gold-10" };
  }
  return { label: status, cls: "text-muted bg-canvas" };
};

type RunHistoryProps = {
  runs: IdeaRunSummary[];
  recordingId: string;
};

const RunHistory = ({ runs, recordingId }: RunHistoryProps) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (runs.length <= 1) return null;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRun(deleteTarget);
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mt-6 rounded-2xl border border-border bg-surface">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-4 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className={`${ui.eyebrow} flex-1`}>Run history</span>
          <span className="text-xs text-muted">
            {runs.length} run{runs.length === 1 ? "" : "s"}
          </span>
          <IconChevron
            size={18}
            className={`text-muted transition ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        {expanded ? (
          <ul className="border-t border-border">
            {runs.map((run) => {
              const badge = runBadge(run.status);
              return (
                <li
                  key={run.id}
                  className="flex items-center border-b border-border last:border-b-0"
                >
                  <Link
                    href={`/ideas/${recordingId}?run=${run.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-sm transition hover:bg-black/[0.02]"
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
                  <button
                    type="button"
                    aria-label={`Delete run from ${formatRunDate(run.createdAt)}`}
                    className="shrink-0 px-4 py-4 text-xs text-muted transition hover:text-red"
                    onClick={() => setDeleteTarget(run.id)}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <DeleteRunSheet
        open={deleteTarget !== null}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default RunHistory;
