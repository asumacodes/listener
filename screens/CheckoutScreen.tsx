"use client";

import AuthHeader from "@/components/auth/AuthHeader";
import AuthIntro from "@/components/auth/AuthIntro";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useCheckoutActions } from "@/hooks";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import {
  resolvePaidCheckoutAction,
  type PaidCheckoutAction,
} from "@/lib/billing/checkoutCta";
import {
  PAID_CHECKOUT_TIERS,
  type CheckoutTier,
  type PaidCheckoutTier,
} from "@/lib/billing/checkoutTier";
import { DODO_PRODUCTS } from "@/lib/billing/dodo-products.config";
import {
  formatPaygPrice,
  formatSubscriptionPrice,
  formatTopUpPrice,
} from "@/lib/billing/dodoDisplay";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import type { ReactNode } from "react";

type CheckoutScreenProps = {
  tier: CheckoutTier;
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
    <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-sm flex-col justify-between">
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

const FoundingPicker = ({
  busy,
  onSubscribe,
}: {
  busy: boolean;
  onSubscribe: (tier: PaidCheckoutTier) => void;
}) => (
  <CheckoutShell
    headline={copy.checkout.pickTier}
    lead={copy.checkout.foundingBanner}
  >
    <div className="mt-8 flex flex-col gap-3">
      {PAID_CHECKOUT_TIERS.map((paid) => {
        const pack = DODO_PRODUCTS[paid];
        return (
          <div key={paid} className={`${ui.cardFlat} p-4`}>
            <p className="font-serif text-[22px] leading-tight text-text">
              {copy.checkout.packs[paid]}
            </p>
            <p className="mt-1 text-[14px] text-text-secondary">
              {copy.checkout.ideas(pack.ideas)}
            </p>
            <p className="mt-1 text-[15px] font-medium text-text">
              {formatSubscriptionPrice(paid)}
            </p>
            <Button
              fullWidth
              className="mt-4"
              disabled={busy}
              onClick={() => onSubscribe(paid)}
            >
              {copy.checkout.continue}
            </Button>
          </div>
        );
      })}
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
      {copy.checkout.continue}
    </Button>
    <Statement />
  </CheckoutShell>
);

const PaidCheckout = ({
  tier,
  action,
  waiting,
  currentPack,
  onSubscribe,
  onTopUp,
  onUpgrade,
}: {
  tier: PaidCheckoutTier;
  action: PaidCheckoutAction;
  waiting: boolean;
  currentPack: string | null;
  onSubscribe: () => void;
  onTopUp: () => void;
  onUpgrade: () => void;
}) => {
  const pack = DODO_PRODUCTS[tier];
  const price =
    action === "topup" ? formatTopUpPrice(tier) : formatSubscriptionPrice(tier);

  return (
    <CheckoutShell
      headline={copy.checkout.headline(copy.checkout.packs[tier])}
      lead={copy.checkout.body}
    >
      <p className="mt-6 text-center text-[15px] text-text-secondary">
        {copy.checkout.ideas(pack.ideas)}
      </p>
      <p className="mt-1 text-center text-[22px] font-medium text-text">
        {price}
      </p>
      {action === "downgrade_blocked" ? (
        <p className="mt-8 text-center text-[15px] leading-relaxed text-text-secondary">
          {copy.checkout.alreadyOn(currentPack ?? copy.checkout.packs[tier])}
        </p>
      ) : action === "topup" ? (
        <Button fullWidth className="mt-8" disabled={waiting} onClick={onTopUp}>
          {copy.checkout.topUp}
        </Button>
      ) : action === "upgrade" ? (
        <Button
          fullWidth
          className="mt-8"
          disabled={waiting}
          onClick={onUpgrade}
        >
          {copy.checkout.upgrade}
        </Button>
      ) : (
        <Button
          fullWidth
          className="mt-8"
          disabled={waiting}
          onClick={onSubscribe}
        >
          {copy.checkout.continue}
        </Button>
      )}
      <Statement />
    </CheckoutShell>
  );
};

const CheckoutScreen = ({ tier }: CheckoutScreenProps) => {
  const { busy, error, clearError, startCheckout, startUpgrade } =
    useCheckoutActions();
  const { balance, loading } = useEntitlementBalance();
  const currentPack = balance?.current_tier
    ? copy.checkout.packs[balance.current_tier]
    : null;
  const paidAction =
    tier === "founding" || tier === "payg"
      ? null
      : resolvePaidCheckoutAction(tier, balance?.current_tier ?? null);

  const toast = error ? <Toast message={error} onDismiss={clearError} /> : null;

  if (tier === "founding") {
    return (
      <>
        {toast}
        <FoundingPicker
          busy={busy}
          onSubscribe={(paid) =>
            void startCheckout({ intent: "subscribe", tier: paid })
          }
        />
      </>
    );
  }

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

  return (
    <>
      {toast}
      <PaidCheckout
        tier={tier}
        action={loading ? "subscribe" : (paidAction ?? "subscribe")}
        waiting={busy || loading}
        currentPack={currentPack}
        onSubscribe={() => void startCheckout({ intent: "subscribe", tier })}
        onTopUp={() => void startCheckout({ intent: "topup", tier })}
        onUpgrade={() => void startUpgrade(tier)}
      />
    </>
  );
};

export default CheckoutScreen;
