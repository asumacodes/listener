"use client";

import QuotaNudge from "@/components/billing/QuotaNudge";
import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import { useQuotaNudge } from "@/hooks/useQuotaNudge";

type OutOfQuotaSheetProps = {
  open: boolean;
  onClose: () => void;
};

const QuotaNudgeBody = ({ enabled }: { enabled: boolean }) => {
  const dismiss = useBottomSheetClose();
  const nudge = useQuotaNudge({ enabled });

  return (
    <QuotaNudge
      view={nudge.view}
      align="start"
      busy={nudge.busy}
      error={nudge.error}
      titleId="out-of-quota-sheet-title"
      onClearError={nudge.clearError}
      onDismiss={dismiss}
      onSubscribe={nudge.onSubscribe}
      onTopUp={nudge.onTopUp}
      onUpgrade={nudge.onUpgrade}
    />
  );
};

/**
 * Shown when fresh kickoff/rerun is blocked by quota (402 or desktop preflight).
 * Self-fetches balance on open; fail-closed until it resolves.
 */
const OutOfQuotaSheet = ({ open, onClose }: OutOfQuotaSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <QuotaNudgeBody enabled={open} />
  </BottomSheet>
);

export default OutOfQuotaSheet;
