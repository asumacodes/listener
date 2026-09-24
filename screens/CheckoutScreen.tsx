"use client";

import FoundingCallout from "@/components/billing/FoundingCallout";
import PlanTierCards from "@/components/billing/PlanTierCards";
import SkeletonTierCards from "@/components/ui/skeleton/SkeletonTierCards";
import { usePlanChoose } from "@/hooks/usePlanPicker";
import type { PlanViewSource } from "@/lib/analytics/billing-events";
import type { FoundingView } from "@/lib/billing/foundingView";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthIntro from "@/components/auth/AuthIntro";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Toast from "@/components/ui/Toast";
import { useCheckoutActions } from "@/hooks";
import type { TierOption } from "@/lib/billing/planView";
import { formatPaygPrice } from "@/lib/billing/dodoDisplay";
import type { DisplayCurrency } from "@/lib/billing/currency";
import useDisplayCurrency from "@/hooks/useDisplayCurrency";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import type { ReactNode } from "react";

type CheckoutScreenProps = {
  /** Paid tiers redirect to /checkout/review; only these two land here. */
  tier: "founding" | "payg";
  /** plan_viewed source when the tier picker shows (ignored for PAYG). */
  source: PlanViewSource;
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
  callout,
  currentName,
  loading,
  onChoose,
}: {
  tiers: TierOption[];
  callout: FoundingView | null;
  currentName: string;
  loading: boolean;
  onChoose: (option: TierOption) => void;
}) => (
  <CheckoutShell
    headline={copy.checkout.pickTier}
    lead={copy.plan.choose.heading}
  >
    <div className="mt-8 flex flex-col gap-3">
      {!loading && callout ? <FoundingCallout view={callout} compact /> : null}
      {loading ? (
        <SkeletonTierCards variant="mobile" />
      ) : (
        <PlanTierCards
          variant="mobile"
          tiers={tiers}
          currentName={currentName}
          onChoose={onChoose}
        />
      )}
    </div>
    <Statement />
  </CheckoutShell>
);

const PaygCheckout = ({
  busy,
  currency,
  onPayg,
}: {
  busy: boolean;
  currency: DisplayCurrency;
  onPayg: () => void;
}) => (
  <CheckoutShell
    headline={copy.checkout.headline(copy.checkout.packs.payg)}
    lead={copy.checkout.body}
  >
    <p className="mt-6 text-center text-[22px] font-medium text-text">
      {formatPaygPrice(currency)}
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

const CheckoutScreen = ({ tier, source }: CheckoutScreenProps) => {
  const { busy, error, clearError, startCheckout } = useCheckoutActions();
  const currency = useDisplayCurrency();
  const picker = usePlanChoose({
    viewSource: tier === "payg" ? null : source,
  });

  const toast = error ? <Toast message={error} onDismiss={clearError} /> : null;

  if (tier === "payg") {
    return (
      <>
        {toast}
        <PaygCheckout
          busy={busy}
          currency={currency}
          onPayg={() => void startCheckout({ intent: "payg" })}
        />
      </>
    );
  }

  return (
    <>
      {toast}
      <TierPicker
        tiers={picker.tiers}
        callout={picker.callout}
        currentName={picker.currentName}
        loading={picker.loading}
        onChoose={picker.choose}
      />
    </>
  );
};

export default CheckoutScreen;
