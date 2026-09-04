"use client";

import FeedbackComposerBody from "@/components/feedback/FeedbackComposerBody";
import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";

type FeedbackSheetProps = {
  open: boolean;
  onClose: () => void;
};

const FeedbackSheetInner = () => {
  const closeWithExit = useBottomSheetClose();

  return (
    <div aria-labelledby="feedback-sheet-title">
      <FeedbackComposerBody
        titleId="feedback-sheet-title"
        onCancel={closeWithExit}
      />
    </div>
  );
};

const FeedbackSheet = ({ open, onClose }: FeedbackSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <FeedbackSheetInner />
  </BottomSheet>
);

export default FeedbackSheet;
