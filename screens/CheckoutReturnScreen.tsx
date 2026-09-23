"use client";

import BalanceUpdatingPill from "@/components/billing/BalanceUpdatingPill";
import { IconCheck } from "@/components/icons/ListenerIcons";
import Button from "@/components/ui/Button";
import { useCheckoutSuccessPoll } from "@/hooks";
import { useProfile } from "@/hooks/useProfile";
import type { CheckoutReturnAction } from "@/lib/billing/checkoutReturn";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { buildReturnView } from "@/lib/billing/returnView";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useRouter } from "next/navigation";

type CheckoutReturnScreenProps = {
  /** Copy-only. Never treat as proof of entitlement. */
  action: CheckoutReturnAction;
  tier: PaidCheckoutTier | null;
};

/**
 * /checkout/return — one screen, three stories. The balance arrives by webhook,
 * so the processing beat stays visible instead of asserting a new number.
 */
const CheckoutReturnScreen = ({ action, tier }: CheckoutReturnScreenProps) => {
  useCheckoutSuccessPoll();
  const router = useRouter();
  const profile = useProfile();
  const view = buildReturnView({ action, tier });

  return (
    <main className="flex min-h-dvh flex-col bg-canvas px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
      <div className="flex justify-center pt-[max(1rem,env(safe-area-inset-top))] md:hidden">
        <span className={ui.shellWordmarkFlow}>Listener</span>
      </div>

      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col md:my-auto md:flex-none md:py-12">
        {/* Mobile — centered hero. */}
        <div className="flex flex-1 flex-col items-center justify-center gap-[18px] px-3 text-center md:hidden">
          <span className={ui.emptyMark}>
            <IconCheck size={26} />
          </span>
          <h1 className="font-serif text-[30px] leading-[1.12] tracking-[-0.01em] text-text">
            {view.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary">
            {view.body}
          </p>
          <BalanceUpdatingPill />
        </div>

        {/* Desktop — a card that states the outcome and moves on. */}
        <div className={`hidden md:flex ${ui.card} flex-col gap-3.5 p-[26px]`}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-10 text-gold">
              <IconCheck size={18} />
            </span>
            <p className={ui.eyebrow}>{view.eyebrow}</p>
          </div>
          <h1 className="font-serif text-[26px] leading-[1.15] text-text">
            {view.title}
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            {view.body}
          </p>
          <div className="flex items-center justify-between gap-3 pt-1.5">
            <BalanceUpdatingPill bare />
            <Button
              className="!min-h-9 shrink-0 rounded-full px-[18px] text-[13px]"
              onClick={() => router.push("/")}
            >
              {copy.plan.returned.studio}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-4 pb-[max(1.875rem,env(safe-area-inset-bottom))] md:hidden">
          <Button fullWidth onClick={() => router.push("/")}>
            {copy.plan.returned.studio}
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted">
            {profile?.email
              ? copy.plan.returned.receipt(profile.email)
              : copy.plan.returned.receiptNoEmail}
          </p>
        </div>
      </div>
    </main>
  );
};

export default CheckoutReturnScreen;
