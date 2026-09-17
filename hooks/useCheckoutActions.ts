"use client";

import {
  changeBillingPlan,
  createBillingCheckout,
  type CheckoutIntent,
} from "@/lib/billing/checkoutSession";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { copy } from "@/lib/design/copy";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type UseCheckoutActions = {
  busy: boolean;
  error: string | null;
  clearError: () => void;
  startCheckout: (input: {
    intent: CheckoutIntent;
    tier?: PaidCheckoutTier;
  }) => Promise<void>;
  startUpgrade: (newTier: PaidCheckoutTier) => Promise<void>;
};

export const useCheckoutActions = (): UseCheckoutActions => {
  const router = useRouter();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const startCheckout = useCallback(
    async (input: { intent: CheckoutIntent; tier?: PaidCheckoutTier }) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy(true);
      setError(null);
      const result = await createBillingCheckout(input);
      if (result.ok) {
        window.location.assign(result.checkout_url);
        return;
      }
      setError(
        result.reason === "dodo_not_configured"
          ? copy.checkout.unavailable
          : copy.checkout.error
      );
      inFlight.current = false;
      setBusy(false);
    },
    []
  );

  const startUpgrade = useCallback(
    async (newTier: PaidCheckoutTier) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy(true);
      setError(null);
      const result = await changeBillingPlan(newTier);
      if (result.ok) {
        router.push("/checkout/success?intent=upgrade");
        return;
      }
      setError(
        result.reason === "subscription_id_unavailable" ||
          result.reason === "dodo_not_configured"
          ? copy.checkout.upgradeUnavailable
          : copy.checkout.error
      );
      inFlight.current = false;
      setBusy(false);
    },
    [router]
  );

  return { busy, error, clearError, startCheckout, startUpgrade };
};

export default useCheckoutActions;
