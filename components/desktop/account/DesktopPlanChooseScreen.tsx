"use client";

import FoundingCallout from "@/components/billing/FoundingCallout";
import PlanTierCards from "@/components/billing/PlanTierCards";
import { IconBack } from "@/components/icons/ListenerIcons";
import SkeletonTierCards from "@/components/ui/skeleton/SkeletonTierCards";
import { usePlanChoose } from "@/hooks/usePlanPicker";
import type { PlanViewSource } from "@/lib/analytics/billing-events";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import Link from "next/link";

/**
 * Desktop plan picker (design 01) — full screen, not a dialog. Idea counts
 * are the hero, one price per tier in the viewer's display currency, and the
 * founding callout reflects the live (thresholded) spots count. No "Not now":
 * the back link returns to Plan & usage.
 */
const DesktopPlanChooseScreen = ({ source }: { source: PlanViewSource }) => {
  const { tiers, callout, currentName, choose, loading } = usePlanChoose({
    viewSource: source,
  });
  const c = copy.plan.choose;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      <header className="flex h-[78px] shrink-0 items-center gap-4 border-b border-border bg-canvas px-11">
        <Link
          href="/account/plan"
          className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-muted uppercase transition hover:text-gold"
        >
          <IconBack size={14} />
          {c.back}
        </Link>
        <p className="ml-auto text-xs text-muted">{copy.plan.billedBy}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[980px] flex-col gap-9 px-8 py-[42px]">
          <div className="flex items-start gap-10">
            <div className="min-w-0 flex-1">
              <p className={ui.eyebrow}>{c.eyebrow}</p>
              <h1 className="mt-4 max-w-[520px] font-serif text-[44px] leading-[1.08] tracking-[-0.01em] text-text">
                {c.heading}
              </h1>
              <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-text-secondary">
                {c.lead}
              </p>
            </div>
            {/* Only once the balance is known — never offer founding to a
                subscriber it can't apply to, even for a beat. */}
            {!loading && callout ? (
              <FoundingCallout
                view={callout}
                className="mt-10 w-[400px] shrink-0"
              />
            ) : null}
          </div>

          {loading ? (
            <SkeletonTierCards variant="desktop" />
          ) : (
            <PlanTierCards
              variant="desktop"
              tiers={tiers}
              currentName={currentName}
              onChoose={choose}
            />
          )}

          <p className="text-[13px] text-muted">{c.footer}</p>
        </div>
      </div>
    </div>
  );
};

export default DesktopPlanChooseScreen;
