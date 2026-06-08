"use client";

import "@/components/illustrations/pipeline/illustration-motion.css";

import TranscribingIllustration from "@/components/illustrations/pipeline/TranscribingIllustration";
import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import LoadingStateCard from "@/components/pipeline/LoadingStateCard";
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
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <LoadingStateCard
          illustration={
            <TranscribingIllustration size={150} animated={!reduceMotion} />
          }
          eyebrow={
            <p className={`${ui.eyebrow} text-gold-deep`}>
              {copy.submitting.eyebrow}…
            </p>
          }
          title={copy.submitting.title}
          subtitle={copy.submitting.subtitle}
        />
      </div>
    </div>
  );
};

export default SubmittingScreen;
