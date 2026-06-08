"use client";

import "@/components/illustrations/pipeline/illustration-motion.css";

import TranscribingIllustration from "@/components/illustrations/pipeline/TranscribingIllustration";
import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { flowScreenClass, shellPaddingX } from "@/lib/layout/shell";

/** Transcribe + save — after Confirm, before Transcript review. */
const SubmittingScreen = () => {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div className={`${flowScreenClass} animate-fade-in`}>
      <div className={shellPaddingX}>
        <FlowWordmarkHeader />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-[150px] w-[150px] items-center justify-center">
          <TranscribingIllustration size={150} animated={!reduceMotion} />
        </div>
        <p className={`${ui.eyebrow} mt-5 text-gold-deep`}>
          {copy.submitting.eyebrow}…
        </p>
        <h1 className="mt-2 font-serif text-[24px] leading-tight text-text">
          {copy.submitting.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {copy.submitting.subtitle}
        </p>
      </div>
    </div>
  );
};

export default SubmittingScreen;
