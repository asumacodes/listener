import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import type { PlanView } from "@/lib/billing/planView";

type AllowanceCardProps = {
  view: PlanView;
  /** Mobile sizing — smaller numeral, no allowance footnote. */
  compact?: boolean;
};

/**
 * Monthly (or free) allowance — the bucket that resets. Never shows extra
 * ideas: the two balances stay in separate cards.
 */
const AllowanceCard = ({ view, compact = false }: AllowanceCardProps) => (
  <div
    className={`${ui.card} flex flex-col ${compact ? "gap-2 px-4 py-3.5" : "gap-3.5 px-[26px] py-6"}`}
  >
    <p className={ui.eyebrow}>{view.allowanceEyebrow}</p>

    <div className="flex items-baseline gap-2">
      <span
        className={`font-serif leading-none tabular-nums text-text ${compact ? "text-4xl" : "text-5xl"}`}
      >
        {view.remaining}
      </span>
      <span className={`text-muted ${compact ? "text-sm" : "text-[15px]"}`}>
        {copy.plan.allowanceLeft(
          view.remaining,
          view.allowance,
          view.remainingNoun
        )}
      </span>
    </div>

    <div
      className="h-1.5 overflow-hidden rounded-full bg-[#F1EFE9]"
      role="meter"
      aria-valuenow={view.remaining}
      aria-valuemin={0}
      aria-valuemax={view.allowance}
      aria-label={view.allowanceEyebrow}
    >
      <div
        className="h-full rounded-full bg-gold transition-[width] duration-300"
        style={{ width: `${view.pct}%` }}
      />
    </div>

    <div className="flex flex-col gap-1">
      <p
        className={`leading-relaxed ${compact ? "text-[13px] text-text-secondary" : "text-sm text-text"}`}
      >
        {view.resetLine}
      </p>
      {compact ? null : (
        <p className="text-[13px] text-muted">{view.allowanceMeta}</p>
      )}
    </div>
  </div>
);

export default AllowanceCard;
