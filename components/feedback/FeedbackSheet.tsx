"use client";

import FeedbackComposerBody from "@/components/feedback/FeedbackComposerBody";
import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import { useFeedbackSubmit } from "@/hooks/useFeedbackSubmit";

type FeedbackSheetProps = {
  open: boolean;
  onClose: () => void;
};

const FeedbackSheetInner = () => {
  const closeWithExit = useBottomSheetClose();
  const { status, submit } = useFeedbackSubmit();

  return (
    <div aria-labelledby="feedback-sheet-title">
      <FeedbackComposerBody
        titleId="feedback-sheet-title"
        onCancel={closeWithExit}
        onSubmit={submit}
        status={status}
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
