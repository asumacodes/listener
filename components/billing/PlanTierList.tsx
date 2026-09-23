import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";
import type { TierOption } from "@/lib/billing/planView";

type PlanTierListProps = {
  tiers: TierOption[];
  currentName: string;
  busy?: boolean;
  onChoose: (option: TierOption) => void;
};

const CurrentPill = () => (
  <span className="rounded-full border border-border px-2.5 py-[3px] text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
    {copy.plan.choose.current}
  </span>
);

/**
 * The tier ladder, one row per paid tier. A locked row (below the current
 * plan) shows why instead of a button — downgrades are refused at checkout.
 */
const PlanTierList = ({
  tiers,
  currentName,
  busy = false,
  onChoose,
}: PlanTierListProps) => (
  <div className="overflow-hidden rounded-2xl border border-border">
    {tiers.map((option) => (
      <div
        key={option.tier}
        className="flex flex-col gap-3 border-b border-border px-[18px] py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-xl leading-tight text-text">
              {option.name}
            </span>
            {option.action === "current" ? <CurrentPill /> : null}
          </div>
          <p className="mt-[3px] text-[13px] text-text-secondary">
            {option.ideasLine}{" "}
            {option.foundingLine ? (
              <span className="text-muted">{option.foundingLine}</span>
            ) : null}
          </p>
          {option.action === "locked" ? (
            <p className="mt-[3px] text-[13px] text-muted">
              {copy.plan.choose.locked(currentName)}
            </p>
          ) : null}
        </div>

        <p className="text-[15px] whitespace-nowrap text-text">
          {option.price} <span className="text-muted">/ mo</span>
        </p>

        <div className="shrink-0 sm:w-24">
          {option.cta ? (
            <Button
              variant="secondary"
              fullWidth
              disabled={busy}
              className="!min-h-9 rounded-full px-[18px] text-[13px]"
              onClick={() => onChoose(option)}
            >
              {option.cta}
            </Button>
          ) : null}
        </div>
      </div>
    ))}
  </div>
);

export default PlanTierList;
