"use client";

import { RehydrationIllustration } from "@/components/illustrations/pipeline/StageIllustration";
import LoadingStateCard from "@/components/pipeline/LoadingStateCard";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { appShellClass } from "@/lib/layout/shell";

/**
 * Pipeline session rehydration (ill-6) — shown while useSessionRestore +
 * resumeActivePipeline restore Postgres-derived pipeline state on tab reopen.
 * Distinct from AppBootstrapScreen (generic auth/session bootstrap).
 */
const RehydrationSplash = () => {
  const reduceMotion = usePrefersReducedMotion();
  const animated = !reduceMotion;

  return (
    <div
      className={`${appShellClass} animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col`}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <LoadingStateCard
          illustration={
            <RehydrationIllustration size={150} animated={animated} />
          }
          eyebrow={
            <p className={`${ui.eyebrow} text-gold-deep`}>
              {copy.rehydration.eyebrow}
            </p>
          }
          title={copy.rehydration.title}
          subtitle={copy.rehydration.subtitle}
        />
      </div>
    </div>
  );
};

export default RehydrationSplash;
