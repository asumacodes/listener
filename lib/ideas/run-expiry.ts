import type { IdeaRunSummary } from "@/types/ideas";

export const RUN_RETENTION_DAYS = 7;

const RUN_RETENTION_MS = RUN_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export type RunDisplayStatus = IdeaRunSummary["status"] | "expired";

/** Results expire after 7 days when the idea is still uncategorised. */
export const isRunResultsExpired = (
  run: IdeaRunSummary | null,
  projectIsDefault: boolean,
  nowMs: number = Date.now()
): boolean => {
  if (!run || run.status !== "done") return false;
  if (!projectIsDefault) return false;
  const age = nowMs - new Date(run.createdAt).getTime();
  return age > RUN_RETENTION_MS;
};

export const getRunDisplayStatus = (
  run: IdeaRunSummary,
  projectIsDefault: boolean,
  nowMs: number = Date.now()
): RunDisplayStatus => {
  if (isRunResultsExpired(run, projectIsDefault, nowMs)) return "expired";
  return run.status;
};

export const runStatusBadge = (status: RunDisplayStatus) => {
  switch (status) {
    case "done":
      return { label: "Done", cls: "bg-gold-10 text-gold" };
    case "failed":
      return { label: "Failed", cls: "bg-error-surface text-red" };
    case "expired":
      return { label: "Expired", cls: "bg-black/[0.04] text-muted" };
    case "running":
    case "queued":
      return { label: "Running", cls: "bg-gold-10 text-gold" };
    default:
      return { label: status, cls: "bg-black/[0.04] text-muted" };
  }
};
