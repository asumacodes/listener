"use client";

import BalanceUpdatingPill from "@/components/billing/BalanceUpdatingPill";
import { IconCheck, IconClock } from "@/components/icons/ListenerIcons";
import SupportSheet from "@/components/support/SupportSheet";
import Button from "@/components/ui/Button";
import PulseDot from "@/components/ui/PulseDot";
import useCheckoutReturn from "@/hooks/useCheckoutReturn";
import { useProfile } from "@/hooks/useProfile";
import type { CheckoutReturnAction } from "@/lib/billing/checkoutReturn";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import type { ReturnPhase } from "@/lib/billing/returnView";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CheckoutReturnScreenProps = {
  /** Copy-only. Never treat as proof of entitlement. */
  action: CheckoutReturnAction;
  tier: PaidCheckoutTier | null;
  /** Dodo `status` was a failure — vetoes success, never grants it. */
  providerFailed: boolean;
};

const Cross = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/** Only `confirmed` gets the check. Everything else is visibly not-success. */
const PhaseMark = ({
  phase,
  size,
}: {
  phase: ReturnPhase;
  size: "hero" | "chip";
}) => {
  const box =
    size === "hero"
      ? "grid h-16 w-16 place-items-center rounded-full"
      : "grid h-9 w-9 shrink-0 place-items-center rounded-full";
  const icon = size === "hero" ? 26 : 18;
  if (phase === "confirmed") {
    return (
      <span className={`${box} bg-gold-10 text-gold`}>
        <IconCheck size={icon} />
      </span>
    );
  }
  if (phase === "failed") {
    return (
      <span className={`${box} bg-error-surface text-red`}>
        <Cross size={icon} />
      </span>
    );
  }
  if (phase === "timeout") {
    return (
      <span className={`${box} bg-surface text-text-secondary`}>
        <IconClock size={icon} />
      </span>
    );
  }
  return (
    <span className={`${box} bg-gold-10`}>
      <PulseDot size="md" />
    </span>
  );
};

/**
 * /checkout/return — confirming → confirmed | failed | timeout. The balance
 * arrives by webhook, so nothing celebrates until a read shows it landed.
 */
const CheckoutReturnScreen = ({
  action,
  tier,
  providerFailed,
}: CheckoutReturnScreenProps) => {
  const view = useCheckoutReturn({ action, tier, providerFailed });
  const router = useRouter();
  const profile = useProfile();
  const [supportOpen, setSupportOpen] = useState(false);
  const { phase } = view;

  const receipt =
    phase === "confirmed"
      ? profile?.email
        ? copy.plan.returned.receipt(profile.email)
        : copy.plan.returned.receiptNoEmail
      : null;

  const toStudio = () => router.push("/");
  const toPlan = () => router.push("/account/plan");

  // Failed and timeout lead to Plan & usage; confirming/confirmed to the studio.
  const primary =
    phase === "failed" || phase === "timeout"
      ? { label: copy.plan.returned.planLink, onClick: toPlan }
      : { label: copy.plan.returned.studio, onClick: toStudio };

  const secondary =
    phase === "timeout"
      ? [
          {
            label: copy.plan.returned.support,
            onClick: () => setSupportOpen(true),
          },
          { label: copy.plan.returned.studio, onClick: toStudio },
        ]
      : phase === "failed"
        ? [{ label: copy.plan.returned.studio, onClick: toStudio }]
        : [];

  const secondaryLinks = secondary.map((s) => (
    <button
      key={s.label}
      type="button"
      onClick={s.onClick}
      className={ui.textLink}
    >
      {s.label}
    </button>
  ));

  return (
    <main
      data-return-phase={phase}
      className="flex min-h-dvh flex-col bg-canvas px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]"
    >
      <div className="flex justify-center pt-[max(1rem,env(safe-area-inset-top))] md:hidden">
        <span className={ui.shellWordmarkFlow}>Listener</span>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex w-full max-w-[600px] flex-1 flex-col md:my-auto md:flex-none md:py-12"
      >
        {/* Mobile — centered hero. */}
        <div className="flex flex-1 flex-col items-center justify-center gap-[18px] px-3 text-center md:hidden">
          <PhaseMark phase={phase} size="hero" />
          <h1 className="font-serif text-[30px] leading-[1.12] tracking-[-0.01em] text-text">
            {view.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary">
            {view.body}
          </p>
          {phase === "confirming" ? <BalanceUpdatingPill /> : null}
        </div>

        {/* Desktop — a card that states the outcome and moves on. */}
        <div className={`hidden md:flex ${ui.card} flex-col gap-3.5 p-[26px]`}>
          <div className="flex items-center gap-3">
            <PhaseMark phase={phase} size="chip" />
            <p className={ui.eyebrow}>{view.eyebrow}</p>
          </div>
          <h1 className="font-serif text-[26px] leading-[1.15] text-text">
            {view.title}
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            {view.body}
          </p>
          {receipt ? (
            <p className="text-xs leading-relaxed text-muted">{receipt}</p>
          ) : null}
          <div className="flex items-center justify-between gap-3 pt-1.5">
            {phase === "confirming" ? (
              <BalanceUpdatingPill bare />
            ) : (
              <span className="flex items-center gap-4">{secondaryLinks}</span>
            )}
            <Button
              className="!min-h-9 shrink-0 rounded-full px-[18px] text-[13px]"
              onClick={primary.onClick}
            >
              {primary.label}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2.5 pt-4 pb-[max(1.875rem,env(safe-area-inset-bottom))] md:hidden">
          <Button fullWidth onClick={primary.onClick}>
            {primary.label}
          </Button>
          {secondaryLinks.length ? (
            <div className="flex items-center gap-4">{secondaryLinks}</div>
          ) : null}
          {receipt ? (
            <p className="text-center text-xs leading-relaxed text-muted">
              {receipt}
            </p>
          ) : null}
        </div>
      </div>

      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
    </main>
  );
};

export default CheckoutReturnScreen;
