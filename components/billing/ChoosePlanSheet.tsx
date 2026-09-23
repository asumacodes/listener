"use client";

import FoundingCallout from "@/components/billing/FoundingCallout";
import PlanTierCards from "@/components/billing/PlanTierCards";
import BottomSheet from "@/components/ui/BottomSheet";
import type { FoundingView } from "@/lib/billing/foundingView";
import type { TierOption } from "@/lib/billing/planView";
import { copy } from "@/lib/design/copy";

type ChoosePlanSheetProps = {
  open: boolean;
  tiers: TierOption[];
  /** Founding-offer callout, or null when the offer can't apply. */
  callout: FoundingView | null;
  currentName: string;
  busy?: boolean;
  onChoose: (option: TierOption) => void;
  onClose: () => void;
};

/**
 * Mobile picker (design 02) as a bottom sheet. No "Not now" button — the
 * backdrop and drag-to-dismiss close it. Desktop uses the full-screen
 * /account/plan/choose route instead.
 */
const ChoosePlanSheet = ({
  open,
  tiers,
  callout,
  currentName,
  busy = false,
  onChoose,
  onClose,
}: ChoosePlanSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <div
      role="dialog"
      aria-labelledby="choose-plan-title"
      className="flex flex-col gap-3.5"
    >
      <h2
        id="choose-plan-title"
        className="text-center font-serif text-[26px] leading-tight text-text"
      >
        {copy.plan.choosePlan}
      </h2>

      {callout ? <FoundingCallout view={callout} compact /> : null}

      <PlanTierCards
        variant="mobile"
        tiers={tiers}
        currentName={currentName}
        busy={busy}
        onChoose={onChoose}
      />

      <p className="text-center text-xs text-muted">
        {copy.plan.choose.footerShort}
      </p>
    </div>
  </BottomSheet>
);

export default ChoosePlanSheet;
