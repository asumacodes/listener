"use client";

import { StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useCheckoutActions, useSubscriptionActions } from "@/hooks";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { nextPaidTier } from "@/lib/billing/checkoutCta";
import { checkoutPath } from "@/lib/billing/checkoutTier";
import { copy } from "@/lib/design/copy";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const formatPlanDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const PlanSection = () => {
  const router = useRouter();
  const { balance, loading, refetch } = useEntitlementBalance();
  const {
    startCheckout,
    startUpgrade,
    busy: checkoutBusy,
    error: checkoutError,
  } = useCheckoutActions();
  const {
    busy: subBusy,
    error,
    scheduled,
    scheduleCancel,
    resume,
  } = useSubscriptionActions({
    serverEndsAt: balance?.subscription_ends_at ?? null,
  });

  useEffect(() => {
    const onFocus = () => {
      void refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refetch]);

  if (loading && !balance) {
    return <p className="text-sm text-muted">…</p>;
  }

  const tier = balance?.current_tier ?? null;
  const packName = tier ? copy.checkout.packs[tier] : copy.settings.planFree;
  const remaining = balance?.effectiveRemaining ?? 0;
  const resetAt = balance?.subscription_reset_at;
  const endsAt = balance?.subscription_ends_at ?? resetAt;
  const nextTier = tier ? nextPaidTier(tier) : null;
  const busy = checkoutBusy || subBusy;

  const usageLine = [
    copy.settings.planIdeasLeft(remaining),
    resetAt ? copy.settings.planResets(formatPlanDate(resetAt)) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const cancelDate = scheduled
    ? endsAt
      ? formatPlanDate(endsAt)
      : null
    : resetAt
      ? formatPlanDate(resetAt)
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text">
          {copy.settings.currentPlan}
        </span>
        <StatusBadge variant="ready" showDot={false}>
          {packName}
        </StatusBadge>
      </div>

      {balance?.founding_member ? (
        <p className="text-sm leading-relaxed text-text-secondary">
          {copy.checkout.foundingBanner}
        </p>
      ) : null}

      <p className="text-sm text-text">{usageLine}</p>
      {balance && balance.purchased_balance > 0 ? (
        <p className="text-sm text-muted">
          {/* purchased_balance only — subscription_grant_remaining is monthly allowance, never this line */}
          {copy.settings.planPurchased(balance.purchased_balance)}
        </p>
      ) : null}

      {checkoutError || error ? (
        <p className="text-sm text-red" role="alert">
          {checkoutError ?? error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {!tier ? (
          <Button
            variant="primary"
            fullWidth
            disabled={busy}
            onClick={() => router.push(checkoutPath("founding"))}
          >
            {copy.settings.planSubscribe}
          </Button>
        ) : (
          <>
            {nextTier ? (
              <Button
                variant="primary"
                fullWidth
                disabled={busy}
                onClick={() => void startUpgrade(nextTier)}
              >
                {copy.checkout.upgrade}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              fullWidth
              disabled={busy}
              onClick={() => void startCheckout({ intent: "topup", tier })}
            >
              {copy.checkout.topUp}
            </Button>
            {scheduled ? (
              <>
                {cancelDate ? (
                  <p className="text-sm text-text-secondary">
                    {copy.settings.planCancelsOn(cancelDate)}
                  </p>
                ) : null}
                <Button
                  variant="outline"
                  fullWidth
                  disabled={busy}
                  onClick={async () => {
                    const ok = await resume();
                    if (ok) void refetch();
                  }}
                >
                  {copy.settings.planResume}
                </Button>
              </>
            ) : (
              <>
                {cancelDate ? (
                  <p className="text-sm text-text-secondary">
                    {copy.settings.planKeepsUntil(cancelDate)}
                  </p>
                ) : null}
                <Button
                  variant="outline"
                  fullWidth
                  disabled={busy}
                  onClick={async () => {
                    const ok = await scheduleCancel();
                    if (ok) void refetch();
                  }}
                >
                  {copy.settings.planCancel}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlanSection;
