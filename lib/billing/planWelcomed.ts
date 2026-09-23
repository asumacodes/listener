/**
 * "Shown once" marker for the confirmed plan welcome (KAN-85 Phase 3b).
 *
 * Stamped with `tier:subscription_reset_at` rather than a bare flag, so the
 * next upgrade — or the next cycle after one — gets its own welcome while a
 * reload of the same cycle does not.
 */

import type { BillingTier } from "@/types/billing";

const keyFor = (userId: string) => `listener:plan-welcomed:${userId}`;

export const planWelcomeStamp = (
  tier: BillingTier | null,
  resetAt: string | null
): string => `${tier ?? "none"}:${resetAt ?? "none"}`;

/** Fail-open: unreadable storage counts as not-welcomed. */
export const readPlanWelcomed = (userId: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(keyFor(userId));
  } catch {
    return null;
  }
};

export const writePlanWelcomed = (userId: string, stamp: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(userId), stamp);
  } catch {
    // Fail-open: the in-memory guard still keeps it to once this mount.
  }
};
