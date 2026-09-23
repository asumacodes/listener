"use client";

import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { buildPlanView } from "@/lib/billing/planView";
import { useMemo } from "react";

/**
 * One-line plan read-out for the Account hub and the Settings stub —
 * "Builder · 9 ideas left · resets Oct 4". Null while loading or when the
 * balance is missing or malformed, so the row never shows a fake number.
 */
export const usePlanSummary = (): {
  rowSub: string | null;
  /** First balance read still in flight — show a skeleton line. */
  loading: boolean;
} => {
  const { balance, loading } = useEntitlementBalance();

  const rowSub = useMemo(
    () => (balance ? buildPlanView({ balance }).rowSub : null),
    [balance]
  );

  return { rowSub, loading: loading && !balance };
};

export default usePlanSummary;
