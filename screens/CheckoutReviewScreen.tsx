"use client";

import { BackButton } from "@/components/layout/AppShellHeader";
import ShellHeaderGrid from "@/components/layout/ShellHeaderGrid";
import Button from "@/components/ui/Button";
import ButtonSpinner from "@/components/ui/ButtonSpinner";
import Toast from "@/components/ui/Toast";
import useCheckoutReview from "@/hooks/useCheckoutReview";
import type {
  PaidCheckoutTier,
  ReviewAction,
} from "@/lib/billing/checkoutTier";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useRouter } from "next/navigation";

type CheckoutReviewScreenProps = {
  tier: PaidCheckoutTier;
  action: ReviewAction;
};

/**
 * /checkout/review — the last calm beat before Dodo. Full screen on mobile,
 * a centered dialog card from md up (the route is surface-exempt, so one
 * responsive layout serves both).
 */
const CheckoutReviewScreen = ({ tier, action }: CheckoutReviewScreenProps) => {
  const router = useRouter();
  const { view, loading, busy, error, clearError, blocked, confirm } =
    useCheckoutReview({ tier, action });

  const back = () => router.push("/account/plan");

  return (
    <main className="flex min-h-dvh flex-col bg-canvas">
      {error ? <Toast message={error} onDismiss={clearError} /> : null}

      <div className="md:hidden">
        <ShellHeaderGrid
          left={<BackButton onClick={back} />}
          center={
            <h1 className={ui.shellPageTitle}>{copy.plan.review.title}</h1>
          }
        />
      </div>

      <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] md:my-auto md:flex-none md:gap-5 md:rounded-3xl md:bg-surface md:px-7 md:py-7 md:shadow-[0_-8px_40px_rgba(26,26,26,0.16)]">
        <div
          className={`mt-4 flex flex-col gap-[18px] ${ui.card} p-5 md:mt-0 md:gap-5 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          <div className="flex flex-col gap-1.5">
            <p className={`${ui.eyebrow} text-gold-deep md:text-muted`}>
              {view.eyebrow}
            </p>
            <h2 className="font-serif text-[30px] leading-[1.15] text-text">
              {view.name}
            </h2>
            <p className="text-[15px] text-text-secondary">{view.ideasLine}</p>
          </div>

          <div className="flex items-baseline gap-2.5 border-t border-border pt-4 md:border-b md:pb-[18px]">
            <span className="font-serif text-[32px] leading-none text-text md:text-[34px]">
              {view.price}
            </span>
            <span className="text-sm text-muted">{view.cadence}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 px-1 text-sm leading-relaxed text-text-secondary md:mt-0 md:px-0">
          <p>{view.note1}</p>
          <p>{view.note2}</p>
          {view.founding ? (
            <p className="text-gold-deep">{copy.plan.foundingBody}</p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-col gap-2.5 pt-6 pb-[max(1.875rem,env(safe-area-inset-bottom))] md:mt-0 md:pt-0 md:pb-0">
          {blocked ? (
            <>
              <p className="text-center text-[15px] leading-relaxed text-text-secondary">
                {copy.checkout.alreadyOn(view.name)}
              </p>
              <Button variant="secondary" fullWidth onClick={back}>
                {copy.plan.review.back}
              </Button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                disabled={busy || loading}
                onClick={() => confirm()}
              >
                {busy ? (
                  <>
                    <ButtonSpinner />
                    {copy.checkout.opening}
                  </>
                ) : (
                  copy.plan.review.cta
                )}
              </Button>
              <p className="text-center text-xs leading-relaxed text-muted">
                {copy.plan.review.statement}
              </p>
              <button
                type="button"
                onClick={back}
                className="hidden self-start py-1 text-sm font-medium text-text-secondary transition hover:text-text md:block"
              >
                {copy.plan.review.back}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default CheckoutReviewScreen;
