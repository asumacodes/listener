"use client";

import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { buildPlanView } from "@/lib/billing/planView";
import { useMemo } from "react";

/**
 * One-line plan read-out for the Account hub and the Settings stub —
 * "Builder · 9 ideas left · resets Oct 4". Null while loading or when the
 * balance is missing or malformed, so the row never shows a fake number.
 */
export const usePlanSummary = (): { rowSub: string | null } => {
  const { balance } = useEntitlementBalance();

  const rowSub = useMemo(
    () => (balance ? buildPlanView({ balance }).rowSub : null),
    [balance]
  );

  return { rowSub };
};

export default usePlanSummary;
