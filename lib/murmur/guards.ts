/**
 * Concurrency guard for pipeline run creation (ADR-037(d), KAN-55).
 *
 * One in-flight run per user. Enforced inside createRun so that every
 * caller is covered — POST /api/murmur/run and POST /api/murmur/resume
 * are the only two today, but a third would inherit the guard for free.
 *
 * /api/murmur/retry deliberately does NOT pass through here: it re-kicks
 * an existing 'queued' row rather than creating one. That row IS the
 * in-flight occupancy this guard protects.
 */

/** Statuses that count as occupying the user's single run slot. */
export const NON_TERMINAL_RUN_STATUSES = ["queued", "running"] as const;

/**
 * Rows older than this stop blocking, so an orphaned non-terminal row
 * cannot lock a user out permanently. The row itself is not repaired —
 * that is the KAN-56 poller follow-up recorded in ADR-037.
 */
export const RUN_STALENESS_WINDOW_MINUTES = 30;

export class ConcurrentRunError extends Error {
  readonly code = "run_in_progress" as const;
  constructor(public readonly activeRunId: string) {
    super("A pipeline run is already in progress for this user.");
    this.name = "ConcurrentRunError";
  }
}
