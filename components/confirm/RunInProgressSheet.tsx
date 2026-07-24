"use client";

import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";

type RunInProgressSheetProps = {
  open: boolean;
  onClose: () => void;
  onGoToPipeline: () => void;
};

const RunInProgressSheetActions = ({
  onGoToPipeline,
}: {
  onGoToPipeline: () => void;
}) => {
  const dismiss = useBottomSheetClose();

  return (
    <div className="mt-6 flex flex-col gap-3">
      <Button
        fullWidth
        onClick={() => {
          onGoToPipeline();
          dismiss();
        }}
      >
        {copy.runInProgress.goToPipeline}
      </Button>
      <Button variant="ghost" fullWidth onClick={() => dismiss()}>
        {copy.runInProgress.stay}
      </Button>
    </div>
  );
};

/**
 * Shown when kickoff/rerun is blocked by an in-flight pipeline run (409).
 * Lets the user choose: open the live run, or stay where they are.
 */
const RunInProgressSheet = ({
  open,
  onClose,
  onGoToPipeline,
}: RunInProgressSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <div role="alertdialog" aria-labelledby="run-in-progress-sheet-title">
      <h2
        id="run-in-progress-sheet-title"
        className="font-serif text-2xl leading-tight text-text"
      >
        {copy.runInProgress.title}
      </h2>
      <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">
        {copy.runInProgress.body}
      </p>
      <RunInProgressSheetActions onGoToPipeline={onGoToPipeline} />
    </div>
  </BottomSheet>
);

export default RunInProgressSheet;
