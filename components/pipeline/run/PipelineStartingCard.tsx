"use client";

import StageIllustration from "@/components/illustrations/pipeline/StageIllustration";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";

/**
 * Run handed off, no stage started yet. Static illustration, no progress bar,
 * no stage count — nothing is running, so nothing may look like it is.
 */
const PipelineStartingCard = () => (
  <div className={`${ui.cardFlat} w-full px-5 py-6 text-center`}>
    <p className={`${ui.eyebrow} text-gold-deep`}>
      {copy.pipeline.starting.eyebrow}
    </p>
    <div className="mx-auto mt-4 flex h-[150px] w-[150px] items-center justify-center">
      {/* null stage = captured and handed off; no pipeline stage implied. */}
      <StageIllustration stage={null} size={150} animated={false} />
    </div>
    <h2 className="mt-4 font-serif text-xl leading-snug text-text">
      {copy.pipeline.starting.title}…
    </h2>
    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
      {copy.pipeline.starting.body}
    </p>
  </div>
);

export default PipelineStartingCard;
