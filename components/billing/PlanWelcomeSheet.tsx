"use client";

import { IconMic } from "@/components/icons/ListenerIcons";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import type { ConfirmedView } from "@/lib/billing/welcomeView";
import { copy } from "@/lib/design/copy";

type PlanWelcomeSheetProps = {
  open: boolean;
  view: ConfirmedView | null;
  onRecord: () => void;
  onDismiss: () => void;
};

const BLOOM_DELAYS = ["0.2s", "0.45s", "0.7s"] as const;

/** Three gold rings opening outward — the calm cousin of confetti. */
const Bloom = () => (
  <span className="pointer-events-none absolute inset-0" aria-hidden>
    {BLOOM_DELAYS.map((delay) => (
      <span
        key={delay}
        style={{ animationDelay: delay }}
        className="absolute inset-3 rounded-full border-[1.5px] border-gold opacity-0 motion-safe:animate-plan-bloom"
      />
    ))}
  </span>
);

/**
 * The second beat: one welcome, fired once, every number read from
 * `get_effective_balance`. A bottom sheet on mobile and a centred dialog from
 * md up — both come from BottomSheet, which already owns the scrim, the
 * escape key and the drag-to-dismiss.
 */
const PlanWelcomeSheet = ({
  open,
  view,
  onRecord,
  onDismiss,
}: PlanWelcomeSheetProps) => (
  <BottomSheet open={open && view !== null} onClose={onDismiss}>
    {view ? (
      <div className="flex flex-col items-center px-1 pb-2 text-center">
        <div className="relative grid h-[120px] w-[120px] place-items-center">
          <Bloom />
          <span className="relative grid h-24 w-24 place-items-center rounded-full bg-gold-10">
            <span className="font-serif text-5xl leading-none tabular-nums text-gold-deep">
              {view.count}
            </span>
          </span>
        </div>

        <p className="mt-3.5 text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
          {view.eyebrow}
        </p>
        <h2 className="mt-2.5 font-serif text-[26px] leading-[1.15] tracking-[-0.01em] text-balance text-text md:text-[28px]">
          {view.title}
        </h2>
        <p className="mt-2.5 max-w-[36ch] text-[15px] leading-relaxed text-pretty text-text-secondary">
          {view.body}
        </p>

        <Button className="mt-6 w-full md:w-auto" onClick={onRecord}>
          <IconMic size={16} className="text-white" />
          {copy.plan.welcome.record}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1.5 min-h-11 w-full text-[15px] font-medium text-text-secondary transition hover:text-text md:w-auto md:px-4"
        >
          {copy.plan.welcome.dismiss}
        </button>
      </div>
    ) : null}
  </BottomSheet>
);

export default PlanWelcomeSheet;
