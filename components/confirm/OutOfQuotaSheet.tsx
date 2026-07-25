"use client";

import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";

type OutOfQuotaSheetProps = {
  open: boolean;
  onClose: () => void;
};

const OutOfQuotaSheetActions = () => {
  const dismiss = useBottomSheetClose();

  return (
    <div className="mt-6 flex flex-col gap-3">
      <Button fullWidth onClick={() => dismiss()}>
        {copy.outOfQuota.dismiss}
      </Button>
    </div>
  );
};

/**
 * Shown when fresh kickoff/rerun is blocked by free-tier balance (402).
 * Dismiss-only — paid plans are not shipped yet (KAN-54 Phase 5).
 */
const OutOfQuotaSheet = ({ open, onClose }: OutOfQuotaSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <div role="alertdialog" aria-labelledby="out-of-quota-sheet-title">
      <h2
        id="out-of-quota-sheet-title"
        className="font-serif text-2xl leading-tight text-text"
      >
        {copy.outOfQuota.title}
      </h2>
      <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">
        {copy.outOfQuota.body}
      </p>
      <OutOfQuotaSheetActions />
    </div>
  </BottomSheet>
);

export default OutOfQuotaSheet;
