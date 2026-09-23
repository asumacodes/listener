"use client";

import AllowanceCard from "@/components/billing/AllowanceCard";
import CancelPlanSheet from "@/components/billing/CancelPlanSheet";
import ChoosePlanSheet from "@/components/billing/ChoosePlanSheet";
import ExtraIdeasCard from "@/components/billing/ExtraIdeasCard";
import FoundingBadge from "@/components/billing/FoundingBadge";
import TopUpSheet from "@/components/billing/TopUpSheet";
import AppShellHeader, { BackButton } from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import Button from "@/components/ui/Button";
import usePlanUsage from "@/hooks/usePlanUsage";
import { entryPlanPrice, type PlanView } from "@/lib/billing/planView";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { appShellClass } from "@/lib/layout/shell";
import { useRouter } from "next/navigation";

const SectionLabel = ({ children }: { children: string }) => (
  <p className={`${ui.eyebrow} mb-2 text-gold-deep`}>{children}</p>
);

const PriceLine = ({ view }: { view: PlanView }) =>
  view.isFree ? (
    <p className="text-sm leading-relaxed text-text-secondary">
      {copy.plan.freeIdeasLine}
      <br />
      <span className="text-muted">
        {copy.plan.freePlansFrom(entryPlanPrice())}
      </span>
    </p>
  ) : (
    <p className="text-sm leading-relaxed text-text-secondary">
      {view.price} <span className="text-muted">{view.priceSuffix}</span>
      <br />
      {view.ideasLine}
    </p>
  );

const PlanUsageScreen = () => {
  const router = useRouter();
  const {
    view,
    loading,
    busy,
    error,
    tiers,
    topUps,
    sheet,
    openSheet,
    closeSheet,
    chooseTier,
    startTopUp,
    confirmCancel,
    resumePlan,
  } = usePlanUsage();

  return (
    <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
      <AppShellHeader
        left={<BackButton onClick={() => router.push("/account")} />}
        title={copy.plan.title}
      />

      <ScrollBody className="gap-4 pt-0">
        {loading ? (
          <p className="text-sm text-muted">…</p>
        ) : !view ? (
          <p className="text-sm text-muted">{copy.plan.unavailable}</p>
        ) : (
          <>
            <section>
              <SectionLabel>{copy.plan.currentPlan}</SectionLabel>
              <div className={`${ui.card} flex flex-col gap-3 px-4 py-3.5`}>
                <div className="flex items-center justify-between gap-2.5">
                  <h2 className="font-serif text-[26px] leading-tight text-text">
                    {view.name}
                  </h2>
                  {view.founding ? <FoundingBadge /> : null}
                </div>

                <PriceLine view={view} />

                {view.founding ? (
                  <p className="border-t border-border pt-3 text-[13px] leading-relaxed text-text-secondary">
                    {copy.plan.foundingBody}{" "}
                    {view.foundingUntil ? (
                      <span className="text-muted">
                        {copy.plan.foundingUntil(view.foundingUntil)}
                      </span>
                    ) : null}
                  </p>
                ) : null}

                {view.cancelScheduled ? (
                  <div className="flex flex-col gap-2.5 border-t border-border pt-3">
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
                      fullWidth
                      disabled={busy}
                      onClick={() => void resumePlan()}
                    >
                      {copy.plan.resume}
                    </Button>
                  </div>
                ) : null}

                <div
                  className={`grid gap-2.5 ${view.showUpgrade ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  {view.showUpgrade ? (
                    <Button
                      variant="secondary"
                      fullWidth
                      disabled={busy}
                      onClick={() => openSheet("choose")}
                    >
                      {view.upgradeLabel}
                    </Button>
                  ) : null}
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled={busy}
                    onClick={() => openSheet("topup")}
                  >
                    {view.addonLabel}
                  </Button>
                </div>
              </div>
            </section>

            <section>
              <SectionLabel>{copy.plan.usage}</SectionLabel>
              <div className="flex flex-col gap-2.5">
                <AllowanceCard view={view} compact />
                {view.showExtra ? <ExtraIdeasCard view={view} compact /> : null}
              </div>
            </section>

            {error ? (
              <p className="text-center text-sm text-red" role="alert">
                {error}
              </p>
            ) : null}

            {view.showCancel ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => openSheet("cancel")}
                className="mx-auto px-2 py-1 text-center text-[13px] text-text-secondary transition hover:text-text disabled:text-muted"
              >
                <span className="font-medium">{copy.plan.cancel}</span>{" "}
                {view.periodEnd ? (
                  <span className="text-muted">
                    {copy.plan.cancelKeeps(view.periodEnd)}
                  </span>
                ) : null}
              </button>
            ) : null}

            <p className="text-center text-xs text-muted">
              {copy.plan.billedBy}
            </p>

            <ChoosePlanSheet
              open={sheet === "choose"}
              tiers={tiers}
              currentName={view.name}
              busy={busy}
              onChoose={chooseTier}
              onClose={closeSheet}
            />
            <TopUpSheet
              open={sheet === "topup"}
              options={topUps}
              busy={busy}
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
      </ScrollBody>
    </main>
  );
};

export default PlanUsageScreen;
