"use client";

import AllowanceCard from "@/components/billing/AllowanceCard";
import CancelPlanSheet from "@/components/billing/CancelPlanSheet";
import ExtraIdeasCard from "@/components/billing/ExtraIdeasCard";
import FoundingBadge from "@/components/billing/FoundingBadge";
import TopUpSheet from "@/components/billing/TopUpSheet";
import Button from "@/components/ui/Button";
import SkeletonPlan from "@/components/ui/skeleton/SkeletonPlan";
import usePlanUsage from "@/hooks/usePlanUsage";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useRouter } from "next/navigation";

const actionClass = "!min-h-9 rounded-full px-[18px] text-[13px]";

/**
 * Desktop plan detail — Account / Plan & usage, centered 880px column.
 * A calm read-out: every change (tier, top-up, cancel) opens a dialog.
 */
const DesktopPlanScreen = () => {
  const router = useRouter();
  const {
    view,
    loading,
    checkoutOpening,
    portalOpening,
    busy,
    error,
    topUps,
    sheet,
    openSheet,
    closeSheet,
    startTopUp,
    confirmCancel,
    resumePlan,
    openPortal,
  } = usePlanUsage();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      <header className="flex h-[78px] shrink-0 items-center gap-4 border-b border-border bg-canvas px-11">
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          {copy.plan.breadcrumb}
        </p>
        <h1 className="font-serif text-[27px] leading-none text-text">
          {copy.plan.title}
        </h1>
        <p className="ml-auto text-xs text-muted">{copy.plan.billedBy}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5 px-8 py-[34px]">
          {loading ? (
            <SkeletonPlan variant="desktop" />
          ) : !view ? (
            <p className="text-sm text-muted">{copy.plan.unavailable}</p>
          ) : (
            <>
              <section
                className={`${ui.card} flex flex-col gap-[18px] px-[26px] py-6`}
              >
                <div className="flex items-start gap-6">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className={ui.eyebrow}>{copy.plan.currentPlan}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-serif text-[30px] leading-tight text-text">
                        {view.name}
                      </h2>
                      {view.founding ? <FoundingBadge /> : null}
                    </div>
                    <p className="text-[15px] text-text-secondary">
                      {view.price}{" "}
                      {view.priceSuffix ? (
                        <span className="text-muted">{view.priceSuffix}</span>
                      ) : null}
                      <span className="mx-1.5 text-muted">·</span>
                      {view.isFree
                        ? copy.plan.freePlansFrom(view.entryPrice)
                        : view.ideasLine}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2.5">
                    {view.showUpgrade ? (
                      <Button
                        variant="secondary"
                        disabled={busy}
                        className={actionClass}
                        onClick={() => router.push("/account/plan/choose")}
                      >
                        {view.upgradeLabel}
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      disabled={busy}
                      className={actionClass}
                      onClick={() => openSheet("topup")}
                    >
                      {view.addonLabel}
                    </Button>
                  </div>
                </div>

                {view.founding ? (
                  <p className="border-t border-border pt-4 text-[13px] leading-relaxed text-text-secondary">
                    {copy.plan.foundingBody}{" "}
                    {view.foundingUntil ? (
                      <span className="text-muted">
                        {copy.plan.foundingUntil(view.foundingUntil)}
                      </span>
                    ) : null}
                  </p>
                ) : null}

                {view.cancelScheduled ? (
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                    <p className="text-[13px] leading-relaxed text-text-secondary">
                      {view.periodEnd
                        ? copy.plan.cancelScheduled(view.periodEnd)
                        : copy.plan.cancelSheet.bodyNoDate(
                            view.extra,
                            view.extraNoun
                          )}
                    </p>
                    <Button
                      variant="outline"
                      disabled={busy}
                      className={`${actionClass} shrink-0`}
                      onClick={() => void resumePlan()}
                    >
                      {copy.plan.resume}
                    </Button>
                  </div>
                ) : null}
              </section>

              <section
                className={
                  view.showExtra ? "grid grid-cols-2 gap-5" : undefined
                }
              >
                <AllowanceCard view={view} />
                {view.showExtra ? <ExtraIdeasCard view={view} /> : null}
              </section>

              {error ? (
                <p className="text-sm text-red" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex items-center justify-between gap-4 px-1.5 py-1">
                <p className="text-xs text-muted">
                  {view.portalAvailable ? (
                    <>
                      {copy.plan.portalNote}{" "}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void openPortal()}
                        className={`${ui.textLink} text-xs disabled:text-muted`}
                      >
                        {portalOpening
                          ? copy.plan.portalOpening
                          : copy.plan.portalLink}
                      </button>
                    </>
                  ) : (
                    copy.plan.portalNone
                  )}
                </p>
                {view.showCancel ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openSheet("cancel")}
                    className="py-2 text-[13px] font-medium text-text-secondary transition hover:text-text disabled:text-muted"
                  >
                    {copy.plan.cancel}{" "}
                    {view.periodEnd ? (
                      <span className="font-normal text-muted">
                        {copy.plan.cancelKeeps(view.periodEnd)}
                      </span>
                    ) : null}
                  </button>
                ) : null}
              </div>

              <TopUpSheet
                open={sheet === "topup"}
                options={topUps}
                busy={busy}
                opening={checkoutOpening}
                onConfirm={startTopUp}
                onClose={closeSheet}
              />
              <CancelPlanSheet
                open={sheet === "cancel"}
                view={view}
                busy={busy}
                onConfirm={() => void confirmCancel()}
                onClose={closeSheet}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopPlanScreen;
