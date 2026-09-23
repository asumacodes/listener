import PulseDot from "@/components/ui/PulseDot";
import { copy } from "@/lib/design/copy";

type BalanceUpdatingPillProps = {
  /** Bare inline row (desktop card footer) instead of the bordered pill. */
  bare?: boolean;
};

/**
 * Honest processing beat after a Dodo return. The grant lands by webhook, so
 * the screen says the balance is still moving rather than claiming a number.
 */
const BalanceUpdatingPill = ({ bare = false }: BalanceUpdatingPillProps) => {
  const dot = <PulseDot />;

  if (bare) {
    return (
      <span className="inline-flex items-center gap-2 text-[13px] whitespace-nowrap text-text-secondary">
        {dot}
        {copy.plan.returned.processing}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] text-text-secondary shadow-card">
      {dot}
      {copy.plan.returned.processing}
    </div>
  );
};

export default BalanceUpdatingPill;
