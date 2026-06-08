"use client";

import "@/components/illustrations/pipeline/illustration-motion.css";

import StageIllustration from "@/components/illustrations/pipeline/StageIllustration";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { ui } from "@/lib/design/ui";
import { getStepperMeta, stepperEyebrow } from "@/lib/pipeline/stage-copy";
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
  const progressPct = Math.round((meta.index / meta.total) * 100);

  return (
    <div className={`${ui.cardFlat} w-full px-5 py-6 text-center`}>
      <p className={`${ui.eyebrow} text-gold-deep`}>{stepperEyebrow(stage)}</p>
      <div className="mx-auto mt-4 flex h-[150px] w-[150px] items-center justify-center">
        <StageIllustration stage={stage} size={150} animated={!reduceMotion} />
      </div>
      <h2 className="mt-4 font-serif text-xl leading-snug text-text">
        {meta.title}…
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {meta.subtitle}
      </p>
      {showLongerHint ? (
        <p className="mt-2 text-sm text-text-secondary">
          Taking a little longer than usual…
        </p>
      ) : null}
      <div className="mt-6 px-2">
        <div className="h-0.5 overflow-hidden rounded-full bg-gold-10">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: meta.total }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i < meta.index ? "bg-gold" : "bg-gold-10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineLoadingCard;
