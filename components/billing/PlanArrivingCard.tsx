"use client";

import PulseDot from "@/components/ui/PulseDot";
import type { ArrivingView } from "@/lib/billing/welcomeView";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";

type PlanArrivingCardProps = {
  view: ArrivingView;
  /** Plan & usage while we're still waiting; support once it's taking long. */
  onAction: () => void;
  /** Offered only on the slow path — before that there's nothing to dismiss. */
  onDismiss?: () => void;
};

/**
 * The first beat, in the WelcomeBanner slot. Deliberately numberless: the
 * grant — and whether it's doubled — is only known once the payload lands.
 */
const PlanArrivingCard = ({
  view,
  onAction,
  onDismiss,
}: PlanArrivingCardProps) => (
  <div
    role="status"
    aria-live="polite"
    className={`${ui.card} shrink-0 px-5 py-[18px] md:flex md:items-center md:gap-5 md:px-6 md:py-5`}
  >
    <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-10 md:grid">
      <PulseDot size="md" />
    </span>

    <div className="min-w-0 flex-1">
      <p
        className={`flex items-center gap-2.5 ${ui.eyebrow} text-gold-deep md:hidden`}
      >
        <PulseDot size="md" />
        {view.eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-[21px] leading-tight tracking-[-0.01em] text-text md:mt-0 md:text-[22px]">
        {view.title}
      </h2>
      <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-text-secondary">
        {view.body}
      </p>
    </div>

    <div className="mt-3 flex items-center gap-4 md:mt-0 md:shrink-0">
      <button type="button" onClick={onAction} className={ui.textLink}>
        {view.actionLabel}
      </button>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="py-1 text-sm font-medium text-text-secondary transition hover:text-text"
        >
          {copy.plan.welcome.dismissArriving}
        </button>
      ) : null}
    </div>
  </div>
);

export default PlanArrivingCard;
