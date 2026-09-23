"use client";

import PlanArrivingCard from "@/components/billing/PlanArrivingCard";
import PlanWelcomeSheet from "@/components/billing/PlanWelcomeSheet";
import SupportSheet from "@/components/support/SupportSheet";
import usePlanWelcome from "@/hooks/usePlanWelcome";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

type PlanWelcomeHostProps = {
  /** Rendered in the banner slot whenever no checkout is arriving. */
  fallback?: ReactNode;
  /** Surface-specific way to start a recording. Defaults to the studio home. */
  onRecord?: () => void;
};

/**
 * Owns both beats of the post-checkout welcome for one surface, so the banner
 * slot has a single occupant and the poll runs once per mounted studio.
 *
 * With no pending checkout the hook does nothing and `fallback` renders — which
 * is why this can sit in front of WelcomeBanner without changing an ordinary
 * visit.
 */
const PlanWelcomeHost = ({
  fallback = null,
  onRecord,
}: PlanWelcomeHostProps) => {
  const router = useRouter();
  const { arriving, confirmed, dismissArriving, dismissConfirmed } =
    usePlanWelcome();
  const [supportOpen, setSupportOpen] = useState(false);

  const record = () => {
    dismissConfirmed();
    if (onRecord) {
      onRecord();
      return;
    }
    router.push("/");
  };

  return (
    <>
      {arriving ? (
        <PlanArrivingCard
          view={arriving}
          onAction={() =>
            arriving.slow ? setSupportOpen(true) : router.push("/account/plan")
          }
          onDismiss={arriving.slow ? dismissArriving : undefined}
        />
      ) : (
        fallback
      )}

      <PlanWelcomeSheet
        open={confirmed !== null}
        view={confirmed}
        onRecord={record}
        onDismiss={dismissConfirmed}
      />

      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
};

export default PlanWelcomeHost;
