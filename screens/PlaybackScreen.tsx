"use client";

import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import PlayerCard from "@/components/capture/PlayerCard";
import { IconArrowRight } from "@/components/icons/ListenerIcons";
import CtaBar from "@/components/ui/CtaBar";
import Button from "@/components/ui/Button";
import useCaptureReviewAnalytics from "@/hooks/useCaptureReviewAnalytics";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { flowScreenClass, shellPaddingX } from "@/lib/layout/shell";

type PlaybackScreenProps = {
  audioUrl: string;
  durationSeconds: number;
  onReRecord: () => void;
  onConfirm: () => void;
};

const PlaybackScreen = ({
  audioUrl,
  durationSeconds,
  onReRecord,
  onConfirm,
}: PlaybackScreenProps) => {
  const review = useCaptureReviewAnalytics({ phase: "review" });

  const handleReRecord = () => {
    review.markAbandoned();
    onReRecord();
  };

  const handleConfirm = () => {
    // Not a kickoff yet (submit → transcribe), but it leaves the review screen
    // toward the run path — suppress the navigate-away abandon on this exit.
    review.markKickedOff();
    onConfirm();
  };

  return (
    <div className={`${flowScreenClass} animate-fade-in`}>
      <div className={shellPaddingX}>
        <FlowWordmarkHeader />
      </div>
      <div
        className={`flex min-h-0 flex-1 flex-col items-center justify-center ${shellPaddingX}`}
      >
        <div className="flex w-full max-w-[330px] flex-col items-center gap-3.5">
          <p className={`${ui.eyebrow} text-center`}>{copy.playback.eyebrow}</p>
          <PlayerCard audioUrl={audioUrl} durationSeconds={durationSeconds} />
        </div>
      </div>
      <CtaBar>
        <Button variant="secondary" fullWidth onClick={handleReRecord}>
          {copy.playback.reRecord}
        </Button>
        <Button fullWidth onClick={handleConfirm}>
          {copy.playback.confirm}
          <IconArrowRight size={16} className="shrink-0" />
        </Button>
      </CtaBar>
    </div>
  );
};

export default PlaybackScreen;
