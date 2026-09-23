"use client";

import { StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonRegion from "@/components/ui/skeleton/SkeletonRegion";
import { useCheckoutActions } from "@/hooks/useCheckoutActions";
import useDisplayCurrency from "@/hooks/useDisplayCurrency";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { buildPlanView } from "@/lib/billing/planView";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useRouter } from "next/navigation";

/**
 * Settings #plan is a stub now — Plan & usage is its own screen
 * (/account/plan), where choosing a tier, topping up and cancelling live.
 * This keeps the deep link working and states the plan in one line.
 */
const PlanSection = () => {
  const router = useRouter();
  const { balance, loading } = useEntitlementBalance();
  const currency = useDisplayCurrency();
  const { openPortal, pending, busy, error } = useCheckoutActions();

  if (loading && !balance) {
    return (
      <SkeletonRegion label={copy.loading.plan} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SkeletonBar className="h-4 w-24" />
          <SkeletonBar className="h-6 w-16 rounded-full" />
        </div>
        <SkeletonBar className="h-4 w-56" />
        <SkeletonBar className="h-12 w-full rounded-xl" />
      </SkeletonRegion>
    );
  }

  // One read: the summary line comes from this view, not a second hook.
  const view = balance ? buildPlanView({ balance, currency }) : null;
  const rowSub = view?.rowSub ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text">
          {copy.settings.currentPlan}
        </span>
        <StatusBadge variant="ready" showDot={false}>
          {view?.name ?? copy.settings.planFree}
        </StatusBadge>
      </div>

      {rowSub ? <p className="text-sm text-text">{rowSub}</p> : null}

      {view?.extra ? (
        <p className="text-sm text-muted">
          {/* purchased_balance only — the monthly allowance is never this line. */}
          {copy.settings.planPurchased(view.extra)}
        </p>
      ) : null}

      <Button
        variant="secondary"
        fullWidth
        onClick={() => router.push("/account/plan")}
      >
        {copy.plan.title}
      </Button>

      <p className="text-xs text-muted">
        {view?.portalAvailable ? (
          <>
            {copy.plan.portalNote}{" "}
            <button
              type="button"
              disabled={busy}
              onClick={() => void openPortal()}
              className={`${ui.textLink} text-xs disabled:text-muted`}
            >
              {pending === "portal"
                ? copy.plan.portalOpening
                : copy.plan.portalLink}
            </button>
          </>
        ) : (
          copy.plan.portalNone
        )}
      </p>
      {error ? (
        <p className="text-xs text-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default PlanSection;
