import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import type { PlanView } from "@/lib/billing/planView";

type ExtraIdeasCardProps = {
  view: PlanView;
  /** Mobile sizing — smaller numeral, the two notes collapse into one line. */
  compact?: boolean;
};

/**
 * Purchased ideas — `purchased_balance` alone. They never expire and survive
 * plan changes and cancellation, so they are never folded into the allowance.
 */
const ExtraIdeasCard = ({ view, compact = false }: ExtraIdeasCardProps) => (
  <div
    className={`${ui.card} flex flex-col ${compact ? "gap-2 px-4 py-3.5" : "gap-3.5 px-[26px] py-6"}`}
  >
    <p className={ui.eyebrow}>{copy.plan.extraIdeas}</p>

    <div className="flex items-baseline gap-2">
      <span
        className={`font-serif leading-none tabular-nums text-text ${compact ? "text-4xl" : "text-5xl"}`}
      >
        {view.extra}
      </span>
      <span className={`text-muted ${compact ? "text-sm" : "text-[15px]"}`}>
        {compact
          ? `purchased · ${copy.plan.extraNeverExpire.toLowerCase()}`
          : copy.plan.extraPurchased(view.extraNoun)}
      </span>
    </div>

    {compact ? null : (
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full bg-success-text"
          aria-hidden
        />
        <span className="text-xs leading-none text-text-secondary">
          {copy.plan.extraNeverExpire}
        </span>
      </div>
    )}

    <div className="flex flex-col gap-1">
      <p
        className={`leading-relaxed ${compact ? "text-[13px] text-text-secondary" : "text-sm text-text"}`}
      >
        {copy.plan.extraUsedAfter(view.allowanceLower)}
        {compact ? ` ${copy.plan.extraKept}` : ""}
      </p>
      {compact ? null : (
        <p className="text-[13px] text-muted">{copy.plan.extraKept}</p>
      )}
    </div>
  </div>
);

export default ExtraIdeasCard;
