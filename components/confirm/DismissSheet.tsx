"use client";

import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";

type DismissSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  dismissLabel: string;
  titleId: string;
};

const DismissSheetActions = ({ dismissLabel }: { dismissLabel: string }) => {
  const dismiss = useBottomSheetClose();

  return (
    <div className="mt-6 flex flex-col gap-3">
      <Button fullWidth onClick={() => dismiss()}>
        {dismissLabel}
      </Button>
    </div>
  );
};

/**
 * Shared dismiss-only gate sheet (out_of_quota, cost_halt).
 * Two-action wait UX stays on RunInProgressSheet.
 */
const DismissSheet = ({
  open,
  onClose,
  title,
  body,
  dismissLabel,
  titleId,
}: DismissSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <div role="alertdialog" aria-labelledby={titleId}>
      <h2 id={titleId} className="font-serif text-2xl leading-tight text-text">
        {title}
      </h2>
      <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">
        {body}
      </p>
      <DismissSheetActions dismissLabel={dismissLabel} />
    </div>
  </BottomSheet>
);

export default DismissSheet;
