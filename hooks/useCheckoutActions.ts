"use client";

import { rememberCheckoutPending } from "@/lib/billing/checkoutPending";
import {
  changeBillingPlan,
  createBillingCheckout,
  createBillingPortal,
  type CheckoutIntent,
} from "@/lib/billing/checkoutSession";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { copy } from "@/lib/design/copy";
import { useCallback, useRef, useState } from "react";

/** Which Dodo handoff is in flight — lets a screen label the button that started it. */
export type CheckoutPendingKind = "checkout" | "upgrade" | "portal";

type UseCheckoutActions = {
  busy: boolean;
  pending: CheckoutPendingKind | null;
  error: string | null;
  clearError: () => void;
  startCheckout: (input: {
    intent: CheckoutIntent;
    tier?: PaidCheckoutTier;
  }) => Promise<void>;
  startUpgrade: (newTier: PaidCheckoutTier) => Promise<void>;
  /** Dodo portal — card and receipts. Plan changes stay in this app. */
  openPortal: () => Promise<void>;
};

export const useCheckoutActions = (): UseCheckoutActions => {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<CheckoutPendingKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const startCheckout = useCallback(
    async (input: { intent: CheckoutIntent; tier?: PaidCheckoutTier }) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy(true);
      setPending("checkout");
      setError(null);
      const result = await createBillingCheckout(input);
      if (result.ok) {
        // Expectation + pre-payment baseline, written only once a session
        // exists. Never proof of a grant — see lib/billing/grantConfirmed.
        await rememberCheckoutPending(
          input.intent === "subscribe"
            ? { action: "subscribe", tier: input.tier ?? null }
            : { action: "topup", tier: input.tier ?? null }
        );
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
      setPending(null);
    },
    []
  );

  const startUpgrade = useCallback(async (newTier: PaidCheckoutTier) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setPending("upgrade");
    setError(null);
    const result = await changeBillingPlan(newTier);
    if (result.ok) {
      await rememberCheckoutPending({ action: "upgrade", tier: newTier });
      window.location.assign(result.payment_link);
      return;
    }
    setError(
      result.reason === "upgrade_pending"
        ? copy.checkout.upgradePending
        : result.reason === "subscription_id_unavailable" ||
            result.reason === "dodo_not_configured"
          ? copy.checkout.upgradeUnavailable
          : copy.checkout.error
    );
    inFlight.current = false;
    setBusy(false);
    setPending(null);
  }, []);

  const openPortal = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setPending("portal");
    setError(null);
    const result = await createBillingPortal();
    if (result.ok) {
      window.location.assign(result.portal_url);
      return;
    }
    setError(
      result.reason === "customer_not_found"
        ? copy.plan.portalNone
        : copy.plan.portalError
    );
    inFlight.current = false;
    setBusy(false);
    setPending(null);
  }, []);

  return {
    busy,
    pending,
    error,
    clearError,
    startCheckout,
    startUpgrade,
    openPortal,
  };
};

export default useCheckoutActions;
