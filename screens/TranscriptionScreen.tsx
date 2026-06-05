"use client";

import AppHeader from "@/components/AppHeader";
import ProjectPickerView from "@/components/ProjectPickerView";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TranscriptionFooter from "@/components/TranscriptionFooter";
import useProjectPicker from "@/hooks/useProjectPicker";
import {
  countWords,
  formatDurationSeconds,
  formatTranscriptionDate,
} from "@/lib/format";
import { languageLabel } from "@/lib/language";
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
  recordedAt,
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
  const isTruncated = wordCount > TRANSCRIPTION_TRUNCATE_WORDS;

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

  const handleSkipAndRecord = () => {
    setShowFilePrompt(false);
    onNewRecording();
  };

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <AppHeader />
      <div className="flex min-h-0 flex-1 flex-col justify-start pt-2">
        <Card>
          {languageDisplay && (
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs text-text">
              Transcription · {languageDisplay}
            </span>
          )}

          <p
            className={`text-base leading-relaxed text-text${isTruncated ? " line-clamp-6" : ""}`}
          >
            {transcription}
          </p>

          {isTruncated && (
            <button
              type="button"
              className="mt-3 text-sm font-medium text-gold hover:opacity-80"
              onClick={() => setShowFullTranscription(true)}
            >
              Read full idea
            </button>
          )}

          {recordingId && (
            <ProjectPickerView
              key={currentProjectId ?? recordingId}
              {...picker}
            />
          )}

          {recordingId && onKickoffPipeline && (
            <Button
              variant="primary"
              fullWidth
              className="mt-4"
              onClick={() => onKickoffPipeline(recordingId)}
            >
              Run Pipeline
            </Button>
          )}

          <div className="mt-6 flex items-center justify-between text-[11px] tracking-wide text-text-secondary uppercase">
            <span>
              {formatDurationSeconds(durationSeconds)} · {wordCount} words
            </span>
            <span>{recordedAt ? formatTranscriptionDate(recordedAt) : ""}</span>
          </div>
        </Card>
      </div>

      <TranscriptionFooter
        transcription={transcription}
        onNewRecording={handleNewRecording}
      />

      <BottomSheet
        open={showFullTranscription}
        onClose={() => setShowFullTranscription(false)}
      >
        <h2 className="font-serif text-2xl text-text">Your idea</h2>
        {languageDisplay && (
          <p className="mt-1 text-xs text-text-secondary">
            Transcription · {languageDisplay}
          </p>
        )}
        <p className="mt-4 max-h-[min(60dvh,28rem)] overflow-y-auto text-base leading-relaxed text-text">
          {transcription}
        </p>
        <p className="mt-4 text-[11px] tracking-wide text-text-secondary uppercase">
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

        {recordingId && (
          <div className="mt-4">
            <ProjectPickerView
              key={`prompt-${currentProjectId ?? recordingId}`}
              {...picker}
            />
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          className="mt-4"
          onClick={handleSkipAndRecord}
        >
          Skip — keep in Uncategorised
        </Button>
      </BottomSheet>
    </div>
  );
};

export default TranscriptionScreen;
