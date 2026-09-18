"use client";

import { updateBillingSubscription } from "@/lib/billing/checkoutSession";
import { copy } from "@/lib/design/copy";
import { useCallback, useRef, useState } from "react";

type Overlay = "scheduled" | "resumed" | null;

type UseSubscriptionActions = {
  busy: boolean;
  error: string | null;
  clearError: () => void;
  scheduled: boolean;
  scheduleCancel: () => Promise<boolean>;
  resume: () => Promise<boolean>;
};

export const useSubscriptionActions = ({
  serverEndsAt,
}: {
  serverEndsAt: string | null;
}): UseSubscriptionActions => {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);

  if (overlay === "scheduled" && serverEndsAt) {
    setOverlay(null);
  } else if (overlay === "resumed" && !serverEndsAt) {
    setOverlay(null);
  }

  const scheduled =
    overlay === "scheduled" || (overlay !== "resumed" && Boolean(serverEndsAt));

  const clearError = useCallback(() => setError(null), []);

  const run = useCallback(async (cancelAtNext: boolean): Promise<boolean> => {
    if (inFlight.current) return false;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    const result = await updateBillingSubscription(cancelAtNext);
    if (result.ok) {
      setOverlay(cancelAtNext ? "scheduled" : "resumed");
      inFlight.current = false;
      setBusy(false);
      return true;
    }
    setError(
      result.reason === "subscription_id_unavailable" ||
        result.reason === "dodo_not_configured"
        ? copy.settings.planUnavailable
        : copy.settings.planError
    );
    inFlight.current = false;
    setBusy(false);
    return false;
  }, []);

  const scheduleCancel = useCallback(() => run(true), [run]);
  const resume = useCallback(() => run(false), [run]);

  return {
    busy,
    error,
    clearError,
    scheduled,
    scheduleCancel,
    resume,
  };
};

export default useSubscriptionActions;
