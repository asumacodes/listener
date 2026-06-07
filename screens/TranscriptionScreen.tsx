"use client";

import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import ProjectAssignRow from "@/components/projects/ProjectAssignRow";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import CtaBar from "@/components/ui/CtaBar";
import { IconCheck, IconCopy } from "@/components/icons/ListenerIcons";
import useProjectPicker from "@/hooks/useProjectPicker";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { countWords } from "@/lib/format";
import { appShellClass } from "@/lib/layout/shell";
import { useCallback, useState } from "react";

type TranscriptionScreenProps = {
  transcription: string;
  language: string | null;
  durationSeconds: number;
  recordedAt: Date | null;
  recordingId: string | null;
  currentProjectId: string | null;
  currentProjectIsDefault: boolean;
  onProjectAssigned?: (projectId: string, isDefault: boolean) => void;
  onNewRecording: () => void;
  onKickoffPipeline?: (recordingId: string) => void;
};

const TranscriptionScreen = ({
  transcription,
  recordingId,
  currentProjectId,
  currentProjectIsDefault,
  onProjectAssigned,
  onNewRecording,
  onKickoffPipeline,
}: TranscriptionScreenProps) => {
  const [showFilePrompt, setShowFilePrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const wordCount = countWords(transcription);
  const isEmpty = wordCount === 0;
  const isLong = wordCount > 42;

  const picker = useProjectPicker({
    recordingId: recordingId ?? "",
    currentProjectId,
    enabled: !!recordingId,
    onAssigned: (projectId, isDefault) => {
      onProjectAssigned?.(projectId, isDefault);
      if (!isDefault) setShowFilePrompt(false);
    },
  });

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

  const handleNewRecording = () => {
    if (currentProjectIsDefault) {
      setShowFilePrompt(true);
      return;
    }
    onNewRecording();
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
    <div
      className={`${appShellClass} animate-fade-in min-h-[calc(100dvh-4.5rem)]`}
    >
      <FlowWordmarkHeader />

      <div className="flex min-h-0 flex-1 flex-col px-6">
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
                <div className="max-h-[330px] overflow-y-auto px-[22px] pt-[46px] pb-[22px] [scrollbar-color:rgba(155,155,155,0.32)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(155,155,155,0.32)]">
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
          <p className="mt-3.5 text-xs tracking-[0.01em] text-muted">
            {`Transcribed · ${wordCount} words`}
          </p>
        ) : null}

        {!isEmpty ? (
          <button
            type="button"
            onClick={handleNewRecording}
            className={ui.flowRelink}
          >
            {copy.transcript.reRecord}
          </button>
        ) : null}

        {copied ? (
          <p
            role="status"
            className="mt-4 self-center animate-fade-in rounded-full bg-success-surface px-4 py-2 text-[13px] font-medium text-success-text"
          >
            {copy.transcript.copied}
          </p>
        ) : null}

        {recordingId ? <ProjectAssignRow {...picker} /> : null}
      </div>

      <CtaBar helper={isEmpty ? undefined : copy.transcript.ctaHelper}>
        {isEmpty ? (
          <Button variant="secondary" fullWidth onClick={onNewRecording}>
            {copy.transcript.reRecordCta}
          </Button>
        ) : onKickoffPipeline && recordingId ? (
          <Button fullWidth onClick={() => onKickoffPipeline(recordingId)}>
            {copy.transcript.runPipeline}
          </Button>
        ) : null}
      </CtaBar>

      <BottomSheet
        open={showFilePrompt}
        onClose={() => setShowFilePrompt(false)}
      >
        <h2 className="font-serif text-2xl text-text">File this recording?</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          It&apos;s still in Uncategorised. Pick a project, or start fresh and
          leave it there.
        </p>
        {recordingId ? (
          <div className="mt-4">
            <ProjectAssignRow {...picker} />
          </div>
        ) : null}
        <Button
          variant="secondary"
          fullWidth
          className="mt-4"
          onClick={() => {
            setShowFilePrompt(false);
            onNewRecording();
          }}
        >
          Skip — keep in Uncategorised
        </Button>
      </BottomSheet>
    </div>
  );
};

export default TranscriptionScreen;
