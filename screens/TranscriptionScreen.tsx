"use client";

import AppHeader from "@/components/AppHeader";
import ProjectPickerView from "@/components/ProjectPickerView";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import TranscriptionFooter from "@/components/TranscriptionFooter";
import useProjectPicker from "@/hooks/useProjectPicker";
import {
  countWords,
  formatDurationSeconds,
  formatLanguageTag,
  formatTranscriptionDate,
} from "@/lib/format";

type TranscriptionScreenProps = {
  transcription: string;
  language: string | null;
  durationSeconds: number;
  recordedAt: Date | null;
  recordingId: string | null;
  currentProjectId: string | null;
  onProjectAssigned?: (projectId: string) => void;
  onNewRecording: () => void;
};

const TranscriptionScreen = ({
  transcription,
  language,
  durationSeconds,
  recordedAt,
  recordingId,
  currentProjectId,
  onProjectAssigned,
  onNewRecording,
}: TranscriptionScreenProps) => {
  const wordCount = countWords(transcription);

  const picker = useProjectPicker({
    recordingId: recordingId ?? "",
    currentProjectId,
    enabled: !!recordingId,
    onAssigned: onProjectAssigned,
  });

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <AppHeader />
      <div className="flex flex-1 flex-col justify-center">
        <Card>
          <Badge className="mb-4">
            Transcription · {formatLanguageTag(language)}
          </Badge>

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
        onNewRecording={onNewRecording}
      />
    </div>
  );
};

export default TranscriptionScreen;
