"use client";

import { useEntitlementBalanceSync } from "@/hooks/useEntitlementBalance";

/** Mounted once by QueryProvider. Keeps a single balance Realtime subscription. */
const EntitlementBalanceSync = () => {
  useEntitlementBalanceSync();
  return null;
};

export default EntitlementBalanceSync;
