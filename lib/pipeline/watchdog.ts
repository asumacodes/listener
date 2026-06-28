// Stall watchdog config (ADR-016). The watchdog sits behind the Realtime
// subscription as a reconciliation backstop while a pipeline stage is active.

/** Backoff offsets after a stage goes active, used for reconciliation re-query. */
export const WATCHDOG_BACKOFF_MS: readonly number[] = [
  5_000, 10_000, 20_000, 40_000, 80_000,
];

/**
 * Single global ceiling. If a stage stays active this long with no transition,
 * surface the "taking longer than usual" state.
 */
export const WATCHDOG_GLOBAL_CEILING_MS = 150_000;
