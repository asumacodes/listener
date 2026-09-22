"use client";

import { StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import usePlanSummary from "@/hooks/usePlanSummary";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { buildPlanView } from "@/lib/billing/planView";
import { copy } from "@/lib/design/copy";
import { useRouter } from "next/navigation";

/**
 * Settings #plan is a stub now — Plan & usage is its own screen
 * (/account/plan), where choosing a tier, topping up and cancelling live.
 * This keeps the deep link working and states the plan in one line.
 */
const PlanSection = () => {
  const router = useRouter();
  const { balance, loading } = useEntitlementBalance();
  const { rowSub } = usePlanSummary();

  if (loading && !balance) {
    return <p className="text-sm text-muted">…</p>;
  }

  const view = balance ? buildPlanView({ balance }) : null;

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
    </div>
  );
};

export default PlanSection;
