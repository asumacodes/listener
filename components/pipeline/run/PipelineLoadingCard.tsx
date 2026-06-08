"use client";

import "@/components/illustrations/pipeline/illustration-motion.css";

import StageIllustration from "@/components/illustrations/pipeline/StageIllustration";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { getStepperMeta } from "@/lib/pipeline/stage-copy";
import type { PipelineStage } from "@/types/pipeline";

type PipelineLoadingCardProps = {
  stage: PipelineStage;
  showLongerHint?: boolean;
};

const PipelineLoadingCard = ({
  stage,
  showLongerHint = false,
}: PipelineLoadingCardProps) => {
  const reduceMotion = usePrefersReducedMotion();
  const meta = getStepperMeta(stage);

  return (
    <div className="px-2 py-6 text-center">
      <div className="mx-auto flex h-[150px] w-[150px] items-center justify-center">
        <StageIllustration stage={stage} size={150} animated={!reduceMotion} />
      </div>
      <p className="mt-4 font-serif text-lg text-text">{meta.title}…</p>
      {showLongerHint ? (
        <p className="mt-2 text-sm text-text-secondary">
          Taking a little longer than usual…
        </p>
      ) : null}
    </div>
  );
};

export default PipelineLoadingCard;
