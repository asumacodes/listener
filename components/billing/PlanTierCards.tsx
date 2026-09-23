import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";
import type { TierOption } from "@/lib/billing/planView";
import { ui } from "@/lib/design/ui";

type PlanTierCardsProps = {
  tiers: TierOption[];
  currentName: string;
  busy?: boolean;
  variant: "desktop" | "mobile";
  onChoose: (option: TierOption) => void;
};

const Tag = ({ children }: { children: string }) => (
  <span className="rounded-full bg-gold-10 px-2.5 py-[3px] text-[10px] font-medium tracking-[0.14em] text-gold-deep uppercase">
    {children}
  </span>
);

const CurrentTag = () => (
  <span className="rounded-full border border-border px-2.5 py-[3px] text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
    {copy.plan.choose.current}
  </span>
);

/** Gold-30 border + gold-10 ring: the Founding badge tint, promoted. */
const recommendedRing =
  "border-[var(--gold-30)] shadow-[0_0_0_4px_var(--gold-10)]";

const TierCard = ({
  option,
  currentName,
  busy,
  desktop,
  onChoose,
}: {
  option: TierOption;
  currentName: string;
  busy: boolean;
  desktop: boolean;
  onChoose: (option: TierOption) => void;
}) => {
  const c = copy.plan.choose;
  return (
    <article
      className={`${ui.card} flex flex-col ${
        desktop ? "gap-4 p-6" : "gap-3 p-[18px]"
      } ${option.recommended ? recommendedRing : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          className={`font-serif leading-tight text-text ${
            desktop ? "text-[24px]" : "text-[20px]"
          }`}
        >
          {option.name}
        </h3>
        {option.action === "current" ? (
          <CurrentTag />
        ) : option.recommended ? (
          <Tag>{c.nextStep}</Tag>
        ) : null}
      </div>

      <div>
        <p className="flex items-baseline gap-2.5">
          <span
            className={`font-serif leading-none text-text ${
              desktop ? "text-[56px]" : "text-[40px]"
            }`}
          >
            {option.ideas}
          </span>
          <span className="text-[15px] text-text-secondary">{c.ideasUnit}</span>
        </p>
        {option.foundingLine ? (
          <p className="mt-2 text-[13px] text-gold-deep">
            {option.foundingLine}
          </p>
        ) : null}
      </div>

      {desktop ? (
        <p className="text-sm leading-relaxed text-text-secondary">
          {option.blurb}
        </p>
      ) : null}

      {option.action === "locked" ? (
        <p className="text-[13px] text-muted">{c.locked(currentName)}</p>
      ) : null}

      <div
        className={`flex items-center justify-between gap-3 border-t border-border pt-4 ${
          desktop ? "mt-auto" : ""
        }`}
      >
        <p className="whitespace-nowrap">
          <span
            className={`font-serif text-text ${desktop ? "text-[22px]" : "text-[19px]"}`}
          >
            {option.price}
          </span>{" "}
          <span className="text-[13px] text-muted">{c.perMo}</span>
        </p>
        {option.cta ? (
          <Button
            variant={option.recommended ? "primary" : "secondary"}
            disabled={busy}
            className="!min-h-10 shrink-0 rounded-full px-5 text-[13px]"
            onClick={() => onChoose(option)}
          >
            {option.cta}
          </Button>
        ) : null}
      </div>
    </article>
  );
};

/**
 * The tier ladder as cards: big idea-count numerals are the hero, one price in
 * the viewer's display currency, and only the "Next step" tier gets the gold
 * primary button (outline elsewhere). Presentation only.
 */
const PlanTierCards = ({
  tiers,
  currentName,
  busy = false,
  variant,
  onChoose,
}: PlanTierCardsProps) => (
  <div
    className={
      variant === "desktop" ? "grid grid-cols-3 gap-5" : "flex flex-col gap-3"
    }
  >
    {tiers.map((option) => (
      <TierCard
        key={option.tier}
        option={option}
        currentName={currentName}
        busy={busy}
        desktop={variant === "desktop"}
        onChoose={onChoose}
      />
    ))}
  </div>
);

export default PlanTierCards;
