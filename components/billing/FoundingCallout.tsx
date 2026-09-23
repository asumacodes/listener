import { copy } from "@/lib/design/copy";
import {
  foundingAllowances,
  type FoundingView,
} from "@/lib/billing/foundingView";

type FoundingCalloutProps = {
  view: FoundingView;
  /** Mobile / tight: smaller sentence, no "applies to" line. */
  compact?: boolean;
  className?: string;
};

const listAllowances = () => {
  const [a, b, c] = foundingAllowances();
  return `${a}, ${b} or ${c}`;
};

/** The solid-gold badge — the only solid-gold label besides the primary button. */
const Badge = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white uppercase">
    <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
    {copy.plan.foundingOffer.badge}
  </span>
);

/** Remaining-spots bar. Gold on a faint gold track — scarcity is never red. */
const SpotsBar = ({ fill }: { fill: number }) => (
  <div
    className="h-1 w-full overflow-hidden rounded-full bg-gold-15"
    aria-hidden
  >
    <div
      className="h-full rounded-full bg-gold transition-[width]"
      style={{ width: `${Math.round(Math.min(1, Math.max(0, fill)) * 100)}%` }}
    />
  </div>
);

/**
 * Founding-offer callout (design 03). Variant A (`static`) whenever the count
 * is unknown; variant B thresholds otherwise. Counts are spots REMAINING.
 */
const FoundingCallout = ({
  view,
  compact = false,
  className = "",
}: FoundingCalloutProps) => {
  const f = copy.plan.foundingOffer;

  if (view.kind === "full") {
    return (
      <p
        className={`rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] text-muted ${className}`}
      >
        {f.full}
      </p>
    );
  }

  const tag =
    view.kind === "open"
      ? f.openNow
      : view.kind === "count"
        ? f.countTag(view.left, view.cap)
        : view.kind === "last"
          ? f.lastTag(view.left)
          : null;

  const line =
    view.kind === "open"
      ? f.openLine
      : view.kind === "count" || view.kind === "last"
        ? f.countLine(view.left, view.cap)
        : null;

  return (
    <section
      aria-label={f.badge}
      className={`flex flex-col gap-3 rounded-2xl border border-[var(--gold-30)] bg-surface shadow-[0_0_0_4px_var(--gold-10)] ${
        compact ? "px-[18px] py-4" : "px-6 py-5"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Badge />
        {tag ? (
          <span className="text-xs font-medium text-gold-deep">{tag}</span>
        ) : null}
      </div>

      <p
        className={`font-serif leading-snug text-text ${
          compact ? "text-[17px]" : "text-[20px]"
        }`}
      >
        {f.sentence}
      </p>

      {view.kind === "static" ? (
        compact ? null : (
          <p className="text-[13px] leading-relaxed text-text-secondary">
            {f.appliesTo(listAllowances())}
          </p>
        )
      ) : (
        <div className="flex flex-col gap-2">
          <SpotsBar fill={view.fill} />
          {line ? (
            <p className="text-[13px] text-text-secondary">{line}</p>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default FoundingCallout;
