"use client";

import SupportComposerBody from "@/components/support/SupportComposerBody";
import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import { useSupportSubmit } from "@/hooks/useSupportSubmit";

type SupportSheetProps = {
  open: boolean;
  onClose: () => void;
};

const SupportSheetInner = () => {
  const closeWithExit = useBottomSheetClose();
  const { status, submit } = useSupportSubmit();

  return (
    <div aria-labelledby="support-sheet-title">
      <SupportComposerBody
        titleId="support-sheet-title"
        onCancel={closeWithExit}
        onSubmit={submit}
        status={status}
      />
    </div>
  );
};

const SupportSheet = ({ open, onClose }: SupportSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <SupportSheetInner />
  </BottomSheet>
);

export default SupportSheet;
