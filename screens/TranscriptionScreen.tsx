"use client";

import CaptureHeader from "@/components/layout/CaptureHeader";
import ProjectAssignRow from "@/components/projects/ProjectAssignRow";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import CtaBar from "@/components/ui/CtaBar";
import TranscriptionFooter from "@/components/TranscriptionFooter";
import useProjectPicker from "@/hooks/useProjectPicker";
import { countWords, formatDurationSeconds } from "@/lib/format";
import { languageLabel } from "@/lib/language";
import { appShellClass } from "@/lib/layout/shell";
import { useState } from "react";

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

const TRANSCRIPTION_TRUNCATE_WORDS = 42;

const TranscriptionScreen = ({
  transcription,
  language,
  durationSeconds,
  recordingId,
  currentProjectId,
  currentProjectIsDefault,
  onProjectAssigned,
  onNewRecording,
  onKickoffPipeline,
}: TranscriptionScreenProps) => {
  const [showFilePrompt, setShowFilePrompt] = useState(false);
  const [showFullTranscription, setShowFullTranscription] = useState(false);
  const wordCount = countWords(transcription);
  const languageDisplay = languageLabel(language);
  const isEmpty = wordCount === 0;
  const isLong = wordCount > TRANSCRIPTION_TRUNCATE_WORDS;

  const picker = useProjectPicker({
    recordingId: recordingId ?? "",
    currentProjectId,
    enabled: !!recordingId,
    onAssigned: (projectId, isDefault) => {
      onProjectAssigned?.(projectId, isDefault);
      if (!isDefault) setShowFilePrompt(false);
    },
  });

  const handleNewRecording = () => {
    if (currentProjectIsDefault) {
      setShowFilePrompt(true);
      return;
    }
    onNewRecording();
  };

  return (
    <div
      className={`${appShellClass} animate-fade-in min-h-[calc(100dvh-4.5rem)]`}
    >
      <CaptureHeader />
      <div className="flex min-h-0 flex-1 flex-col pt-2">
        <p className="type-eyebrow">Transcript</p>
        <h1 className="mt-2 font-serif text-[26px] leading-tight text-text">
          Did we hear you right?
        </h1>

        <div
          className={`transcript-card mt-5 rounded-2xl border border-border bg-surface p-5 shadow-card ${
            isLong ? "relative max-h-64 overflow-hidden" : ""
          } ${isEmpty ? "border-dashed border-dashed-add bg-canvas" : ""}`}
        >
          {isEmpty ? (
            <p className="text-center text-sm text-text-secondary">
              We didn&apos;t catch enough to work with
            </p>
          ) : (
            <p className="text-base leading-relaxed text-text whitespace-pre-wrap">
              {transcription}
            </p>
          )}
          {isLong ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
          ) : null}
        </div>

        {!isEmpty && isLong ? (
          <button
            type="button"
            className="type-textlink mt-3"
            onClick={() => setShowFullTranscription(true)}
          >
            Read full idea
          </button>
        ) : null}

        {!isEmpty ? (
          <p className="flow-meta mt-3 text-xs text-muted">
            Transcribed · {wordCount} words
            {languageDisplay ? ` · ${languageDisplay}` : ""}
          </p>
        ) : null}

        {!isEmpty ? (
          <button
            type="button"
            className="type-textlink mt-2"
            onClick={onNewRecording}
          >
            Re-record instead
          </button>
        ) : null}

        {recordingId ? <ProjectAssignRow {...picker} /> : null}
      </div>

      <CtaBar
        helper={
          isEmpty
            ? undefined
            : "This turns your idea into a PRD, research, brand, and a board."
        }
      >
        {isEmpty ? (
          <Button variant="secondary" fullWidth onClick={onNewRecording}>
            Re-record
          </Button>
        ) : (
          <>
            {onKickoffPipeline && recordingId ? (
              <Button fullWidth onClick={() => onKickoffPipeline(recordingId)}>
                Run Pipeline →
              </Button>
            ) : null}
          </>
        )}
      </CtaBar>

      <TranscriptionFooter
        transcription={transcription}
        onNewRecording={handleNewRecording}
      />

      <BottomSheet
        open={showFullTranscription}
        onClose={() => setShowFullTranscription(false)}
      >
        <h2 className="font-serif text-2xl text-text">Your idea</h2>
        <p className="mt-4 max-h-[min(60dvh,28rem)] overflow-y-auto text-base leading-relaxed text-text whitespace-pre-wrap">
          {transcription}
        </p>
        <p className="mt-4 text-xs text-muted">
          {formatDurationSeconds(durationSeconds)} · {wordCount} words
        </p>
      </BottomSheet>

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
