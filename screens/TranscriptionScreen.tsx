import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import TranscriptionFooter from "@/components/TranscriptionFooter";
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
  onNewRecording: () => void;
};

const TranscriptionScreen = ({
  transcription,
  language,
  durationSeconds,
  recordedAt,
  onNewRecording,
}: TranscriptionScreenProps) => {
  const wordCount = countWords(transcription);

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <div className="flex flex-1 flex-col justify-center">
        <Card>
          <Badge className="mb-4">
            Transcription · {formatLanguageTag(language)}
          </Badge>

          <p className="text-base leading-relaxed text-text-primary">
            {transcription}
          </p>

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
