"use client";

import QuotaNudge from "@/components/billing/QuotaNudge";
import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import { useQuotaNudge } from "@/hooks/useQuotaNudge";
import type { AnalyticsSurface } from "@/lib/analytics/events";

type OutOfQuotaSheetProps = {
  open: boolean;
  /** For quota_hit — which app surface hit the wall. */
  surface: AnalyticsSurface;
  onClose: () => void;
};

const QuotaNudgeBody = ({
  enabled,
  surface,
}: {
  enabled: boolean;
  surface: AnalyticsSurface;
}) => {
  const dismiss = useBottomSheetClose();
  const nudge = useQuotaNudge({ enabled, surface, onDismiss: dismiss });

  return (
    <QuotaNudge
      view={nudge.view}
      align="start"
      busy={nudge.busy}
      error={nudge.error}
      titleId="out-of-quota-sheet-title"
      onClearError={nudge.clearError}
      onDismiss={nudge.onDismiss}
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
const OutOfQuotaSheet = ({ open, surface, onClose }: OutOfQuotaSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <QuotaNudgeBody enabled={open} surface={surface} />
  </BottomSheet>
);

export default OutOfQuotaSheet;
