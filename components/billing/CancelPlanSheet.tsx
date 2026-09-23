"use client";

import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";
import type { PlanView } from "@/lib/billing/planView";

type CancelPlanSheetProps = {
  open: boolean;
  view: PlanView;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const CancelActions = ({
  busy,
  onConfirm,
}: {
  busy: boolean;
  onConfirm: () => void;
}) => {
  const dismiss = useBottomSheetClose();
  const actionClass = "!min-h-11 rounded-full px-4 text-[13px]";
  // Safe action first and primary (gold); cancelling is the quieter choice.
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Button
        className={actionClass}
        disabled={busy}
        onClick={() => {
          if (!busy) dismiss();
        }}
      >
        {copy.plan.cancelSheet.keep}
      </Button>
      <Button
        variant="secondary"
        className={actionClass}
        disabled={busy}
        onClick={onConfirm}
      >
        {copy.plan.cancelSheet.confirm}
      </Button>
    </div>
  );
};

/**
 * Cancellation is always period-end — the plan keeps running, the ideas stay,
 * and extra ideas survive it entirely. Say all three before confirming.
 */
const CancelPlanSheet = ({
  open,
  view,
  busy = false,
  onConfirm,
  onClose,
}: CancelPlanSheetProps) => (
  <BottomSheet open={open} onClose={onClose} lockDismiss={busy}>
    <div role="alertdialog" aria-labelledby="cancel-plan-title">
      <h2
        id="cancel-plan-title"
        className="font-serif text-2xl leading-tight text-text"
      >
        {copy.plan.cancelSheet.title(view.name)}
      </h2>
      <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">
        {view.periodEnd
          ? view.extra > 0
            ? copy.plan.cancelSheet.body(
                view.periodEnd,
                view.extra,
                view.extraNoun
              )
            : copy.plan.cancelSheet.bodyNoExtra(view.periodEnd)
          : view.extra > 0
            ? copy.plan.cancelSheet.bodyNoDate(view.extra, view.extraNoun)
            : copy.plan.cancelSheet.bodyNoDateNoExtra}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        {copy.plan.cancelSheet.note}
      </p>
      <div className="mt-6">
        <CancelActions busy={busy} onConfirm={onConfirm} />
      </div>
    </div>
  </BottomSheet>
);

export default CancelPlanSheet;
