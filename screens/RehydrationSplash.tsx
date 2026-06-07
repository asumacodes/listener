"use client";

import { RehydrationIllustration } from "@/components/illustrations/pipeline/StageIllustration";

import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

import { copy } from "@/lib/design/copy";

import { appShellClass } from "@/lib/layout/shell";

/** Shown on reopen while Postgres-derived pipeline state is restored. */

const RehydrationSplash = () => {
  const reduceMotion = usePrefersReducedMotion();

  const animated = !reduceMotion;

  return (
    <div
      className={`${appShellClass} animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col`}
    >
      <div className="rehydrate-center flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="rehydrate-art mb-[34px] flex h-[140px] w-[140px] items-center justify-center">
          <RehydrationIllustration size={140} animated={animated} />
        </div>

        <div className="w-full max-w-sm rounded-[20px] border border-border bg-canvas px-8 py-9 shadow-card">
          <p className="type-eyebrow text-[var(--ill-gold-deep,#A8824A)]">
            {copy.rehydration.eyebrow}
          </p>

          <h1 className="rehydrate-title mt-2 font-serif text-[26px] leading-[1.15] tracking-tight text-text">
            {copy.rehydration.title}
          </h1>

          <p className="rehydrate-sub mt-3 text-sm leading-relaxed text-text-secondary">
            {copy.rehydration.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RehydrationSplash;
