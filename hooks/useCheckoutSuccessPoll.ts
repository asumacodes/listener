"use client";

import { getBalanceForDisplay } from "@/lib/billing/displayBalance";
import { useEffect } from "react";

const POLL_MS = 2000;
const CAP_MS = 20000;

/**
 * Warm the studio pill after Dodo return. Never treats query params as a grant.
 * Poll errors are ignored — the success screen stays on processing copy.
 */
export const useCheckoutSuccessPoll = () => {
  useEffect(() => {
    let cancelled = false;
    let elapsed = 0;

    const tick = async () => {
      try {
        await getBalanceForDisplay();
      } catch {
        // Fail-closed: keep processing UI even if the RPC errors.
      }
    };

    void tick();
    const id = window.setInterval(() => {
      elapsed += POLL_MS;
      if (cancelled || elapsed >= CAP_MS) {
        window.clearInterval(id);
        return;
      }
      void tick();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);
};

export default useCheckoutSuccessPoll;
