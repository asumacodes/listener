"use client";

import PlanTierList from "@/components/billing/PlanTierList";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthIntro from "@/components/auth/AuthIntro";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Toast from "@/components/ui/Toast";
import { useCheckoutActions } from "@/hooks";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { reviewPath } from "@/lib/billing/checkoutTier";
import {
  buildTierOptions,
  foundingActive,
  tierName,
  type TierOption,
} from "@/lib/billing/planView";
import { formatPaygPrice } from "@/lib/billing/dodoDisplay";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type CheckoutScreenProps = {
  /** Paid tiers redirect to /checkout/review; only these two land here. */
  tier: "founding" | "payg";
};

const Statement = () => (
  <p className="mt-4 text-center text-[13px] leading-relaxed text-muted">
    {copy.checkout.statement}
  </p>
);

const CheckoutShell = ({
  headline,
  lead,
  children,
}: {
  headline: string;
  lead: string;
  children: ReactNode;
}) => (
  <AuthLayout>
    <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col justify-between">
      <AuthHeader />
      <div className="w-full">
        <p className={`mb-3 text-center ${ui.eyebrow}`}>
          {copy.checkout.eyebrow}
        </p>
        <AuthIntro headline={headline} lead={lead} />
        {children}
      </div>
      <div />
    </div>
  </AuthLayout>
);

const TierPicker = ({
  tiers,
  currentName,
  onChoose,
}: {
  tiers: TierOption[];
  currentName: string;
  onChoose: (option: TierOption) => void;
}) => (
  <CheckoutShell
    headline={copy.checkout.pickTier}
    lead={copy.checkout.foundingBanner}
  >
    <div className="mt-8">
      <PlanTierList
        tiers={tiers}
        currentName={currentName}
        onChoose={onChoose}
      />
    </div>
    <Statement />
  </CheckoutShell>
);

const PaygCheckout = ({
  busy,
  onPayg,
}: {
  busy: boolean;
  onPayg: () => void;
}) => (
  <CheckoutShell
    headline={copy.checkout.headline(copy.checkout.packs.payg)}
    lead={copy.checkout.body}
  >
    <p className="mt-6 text-center text-[22px] font-medium text-text">
      {formatPaygPrice()}
    </p>
    <Button fullWidth className="mt-8" disabled={busy} onClick={onPayg}>
      {busy ? (
        <>
          <Spinner size="sm" tone="current" />
          {copy.checkout.opening}
        </>
      ) : (
        copy.checkout.continue
      )}
    </Button>
    <Statement />
  </CheckoutShell>
);

const CheckoutScreen = ({ tier }: CheckoutScreenProps) => {
  const router = useRouter();
  const { busy, error, clearError, startCheckout } = useCheckoutActions();
  const { balance } = useEntitlementBalance();

  const toast = error ? <Toast message={error} onDismiss={clearError} /> : null;

  if (tier === "payg") {
    return (
      <>
        {toast}
        <PaygCheckout
          busy={busy}
          onPayg={() => void startCheckout({ intent: "payg" })}
        />
      </>
    );
  }

  const tiers = buildTierOptions({
    currentTier: balance?.current_tier ?? null,
    founding: balance ? foundingActive(balance) : false,
  });

  return (
    <>
      {toast}
      <TierPicker
        tiers={tiers}
        currentName={tierName(balance?.current_tier ?? null)}
        onChoose={(option) => {
          if (option.action !== "subscribe" && option.action !== "upgrade") {
            return;
          }
          router.push(reviewPath(option.tier, option.action));
        }}
      />
    </>
  );
};

export default CheckoutScreen;
