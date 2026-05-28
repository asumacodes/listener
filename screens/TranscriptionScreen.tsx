"use client";

import AppHeader from "@/components/AppHeader";
import ProjectPickerView from "@/components/ProjectPickerView";
import BottomSheet from "@/components/ui/BottomSheet";
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
};

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
}: TranscriptionScreenProps) => {
  const [showFilePrompt, setShowFilePrompt] = useState(false);
  const wordCount = countWords(transcription);
  const languageDisplay = languageLabel(language);

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
      <div className="flex flex-1 flex-col justify-center">
        <Card>
          {languageDisplay && (
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs text-text">
              Transcription · {languageDisplay}
            </span>
          )}

          <p className="text-base leading-relaxed text-text">{transcription}</p>

          {recordingId && (
            <ProjectPickerView
              key={currentProjectId ?? recordingId}
              {...picker}
            />
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

        <button
          type="button"
          onClick={handleSkipAndRecord}
          className="mt-6 w-full py-2 text-center text-sm text-muted transition hover:text-text"
        >
          Skip — keep in Uncategorised
        </button>
      </BottomSheet>
    </div>
  );
};

export default TranscriptionScreen;
