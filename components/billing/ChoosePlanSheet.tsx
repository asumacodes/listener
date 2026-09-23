"use client";

import PlanTierList from "@/components/billing/PlanTierList";
import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";
import type { TierOption } from "@/lib/billing/planView";

type ChoosePlanSheetProps = {
  open: boolean;
  tiers: TierOption[];
  currentName: string;
  busy?: boolean;
  onChoose: (option: TierOption) => void;
  onClose: () => void;
};

const NotNow = () => {
  const dismiss = useBottomSheetClose();
  return (
    <Button
      variant="ghost"
      className="!min-h-0 self-start px-0 py-2 text-sm"
      onClick={dismiss}
    >
      {copy.plan.choose.notNow}
    </Button>
  );
};

/** Sheet on mobile, centered dialog from md up — BottomSheet handles both. */
const ChoosePlanSheet = ({
  open,
  tiers,
  currentName,
  busy = false,
  onChoose,
  onClose,
}: ChoosePlanSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <div
      role="dialog"
      aria-labelledby="choose-plan-title"
      className="flex flex-col gap-[18px]"
    >
      <div>
        <h2
          id="choose-plan-title"
          className="font-serif text-[26px] leading-tight text-text"
        >
          {copy.plan.choosePlan}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          {copy.plan.choose.lead}
        </p>
      </div>

      <PlanTierList
        tiers={tiers}
        currentName={currentName}
        busy={busy}
        onChoose={onChoose}
      />

      <p className="text-[13px] leading-relaxed text-text-secondary">
        {copy.plan.foundingBody}
      </p>

      <NotNow />
    </div>
  </BottomSheet>
);

export default ChoosePlanSheet;
