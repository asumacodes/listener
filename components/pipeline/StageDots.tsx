"use client";

import { PIPELINE_STAGE_ORDER } from "@/lib/pipeline/stage-copy";
import type { PipelineStage } from "@/types/pipeline";

type StageDotsProps = {
  activeStage: PipelineStage | null;
};

const StageDots = ({ activeStage }: StageDotsProps) => {
  const activeIndex = activeStage
    ? PIPELINE_STAGE_ORDER.indexOf(activeStage)
    : 0;

  return (
    <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
      {PIPELINE_STAGE_ORDER.map((stage, index) => (
        <span
          key={stage}
          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
            index === activeIndex
              ? "scale-[1.15] bg-gold-deep"
              : index < activeIndex
                ? "bg-gold/60"
                : "bg-border"
          }`}
        />
      ))}
    </div>
  );
};

export default StageDots;
