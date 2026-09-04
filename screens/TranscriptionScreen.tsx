"use client";

import AtlassianConnectSheet from "@/components/integrations/AtlassianConnectSheet";
import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import Button from "@/components/ui/Button";
import CtaBar from "@/components/ui/CtaBar";
import {
  IconArrowRight,
  IconCheck,
  IconCopy,
} from "@/components/icons/ListenerIcons";
import useCaptureReviewAnalytics from "@/hooks/useCaptureReviewAnalytics";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { countWords } from "@/lib/format";
import { trackCaptureAbandoned } from "@/lib/analytics/events";
import { hasFired, markFired } from "@/lib/analytics/run-fired-guard";
import { getAtlassianStatus } from "@/lib/integrations/atlassian/client";
import { flowScreenClass, shellPaddingX } from "@/lib/layout/shell";
import { useCallback, useEffect, useState } from "react";

type TranscriptionScreenProps = {
  transcription: string;
  language: string | null;
  durationSeconds: number;
  recordedAt: Date | null;
  recordingId: string | null;
  onNewRecording: () => void;
  onKickoffPipeline?: (recordingId: string) => void;
};

const TranscriptionScreen = ({
  transcription,
  recordingId,
  onNewRecording,
  onKickoffPipeline,
}: TranscriptionScreenProps) => {
  const [copied, setCopied] = useState(false);
  const [atlassianConnected, setAtlassianConnected] = useState<boolean | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const wordCount = countWords(transcription);
  const isEmpty = wordCount === 0;
  const isLong = wordCount > 42;

  const review = useCaptureReviewAnalytics({
    phase: "transcript",
    recordingId: recordingId ?? undefined,
  });

  useEffect(() => {
    let active = true;
    void getAtlassianStatus()
      .then((status) => active && setAtlassianConnected(status.connected))
      .catch(() => active && setAtlassianConnected(false));
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!transcription) return;
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [transcription]);

  const handleRun = useCallback(() => {
    if (!recordingId || !onKickoffPipeline) return;
    if (atlassianConnected === false) {
      setSheetOpen(true);
      return;
    }
    review.markKickedOff();
    onKickoffPipeline(recordingId);
  }, [recordingId, onKickoffPipeline, atlassianConnected, review]);

  const handleAtlassianConnected = useCallback(() => {
    setAtlassianConnected(true);
    setSheetOpen(false);
    review.markKickedOff();
    if (recordingId) onKickoffPipeline?.(recordingId);
  }, [recordingId, onKickoffPipeline, review]);

  const handleReRecord = () => {
    review.markAbandoned();
    onNewRecording();
  };

  // Atlassian sheet dismissed WITHOUT connecting → stay on transcript + Run Pipeline.
  const handleAtlassianDismiss = () => {
    setSheetOpen(false);
    const guardId = recordingId ?? "pre_save";
    if (!hasFired("capture_abandoned:atlassian_precheck", guardId)) {
      trackCaptureAbandoned(
        "atlassian_precheck",
        "mobile",
        recordingId ?? undefined
      );
      markFired("capture_abandoned:atlassian_precheck", guardId);
    }
  };

  const copyButton = !isEmpty ? (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label="Copy transcript"
      className={`absolute top-3 right-3 z-10 grid h-[34px] w-[34px] place-items-center rounded-lg border bg-surface transition-colors ${
        copied
          ? "border-gold-30 text-gold"
          : "border-border text-muted hover:text-text-secondary"
      }`}
    >
      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
    </button>
  ) : null;

  return (
    <div className={`${flowScreenClass} animate-fade-in`}>
      <div className={shellPaddingX}>
        <FlowWordmarkHeader />
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide pt-[60px] ${shellPaddingX}`}
      >
        <p className={ui.eyebrow}>{copy.transcript.eyebrow}</p>
        <h1 className={`${ui.flowTitle} mb-[22px] mt-2.5`}>
          {copy.transcript.title}
        </h1>

        {isEmpty ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-border bg-surface p-[22px] shadow-card">
            <p className="text-center text-[15px] text-muted">
              {copy.transcript.empty}
            </p>
          </div>
        ) : (
          <div
            className={`relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card ${
              isLong ? "p-0" : "p-[22px]"
            }`}
          >
            {copyButton}
            {isLong ? (
              <>
                <div className="max-h-[330px] overflow-y-auto scrollbar-hide px-[22px] pt-[46px] pb-[22px]">
                  {transcription.split("\n\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className={`text-base leading-[1.65] text-pretty text-text ${
                        i > 0 ? "mt-3.5" : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent" />
              </>
            ) : (
              <p className="pr-9 text-base leading-[1.65] text-pretty text-text whitespace-pre-wrap">
                {transcription}
              </p>
            )}
          </div>
        )}

        {!isEmpty ? (
          <div className="mt-3.5 flex items-center justify-between gap-4">
            <p className="text-xs tracking-[0.01em] text-muted">
              {`Transcribed · ${wordCount} words`}
            </p>
            <button
              type="button"
              onClick={handleReRecord}
              className={`${ui.flowRelink} shrink-0 underline underline-offset-2`}
            >
              {copy.transcript.reRecord}
            </button>
          </div>
        ) : null}

        {copied ? (
          <p
            role="status"
            className="mt-4 self-center animate-fade-in rounded-full bg-success-surface px-4 py-2 text-[13px] font-medium text-success-text"
          >
            {copy.transcript.copied}
          </p>
        ) : null}
      </div>

      <CtaBar helper={isEmpty ? undefined : copy.transcript.ctaHelper}>
        {isEmpty ? (
          <Button variant="secondary" fullWidth onClick={handleReRecord}>
            {copy.transcript.reRecordCta}
          </Button>
        ) : onKickoffPipeline && recordingId ? (
          <Button
            fullWidth
            disabled={atlassianConnected === null}
            onClick={handleRun}
          >
            {copy.transcript.runPipeline}
            <IconArrowRight size={16} className="shrink-0" />
          </Button>
        ) : null}
      </CtaBar>

      <AtlassianConnectSheet
        open={sheetOpen}
        onClose={handleAtlassianDismiss}
        onConnected={handleAtlassianConnected}
      />
    </div>
  );
};

export default TranscriptionScreen;
