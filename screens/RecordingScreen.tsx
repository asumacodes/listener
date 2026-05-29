import AppHeader from "@/components/AppHeader";
import RecordButton from "@/components/RecordButton";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { formatTime } from "@/lib/format";
import { MAX_RECORDING_SECONDS } from "@/lib/media/recorder";

interface RecordingScreenProps {
  elapsedSeconds: number;
  recordingStream: MediaStream | null;
  onStop: () => void;
}

const RecordingScreen = ({
  elapsedSeconds,
  recordingStream,
  onStop,
}: RecordingScreenProps) => {
  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <AppHeader />

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs text-text">
          <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden />
          {formatTime(MAX_RECORDING_SECONDS)} max
        </span>
        <RecordButton mode="recording" onClick={onStop} />

        <p className="font-serif text-5xl tracking-tight text-text">
          {formatTime(elapsedSeconds)}
        </p>

        <WaveformVisualizer stream={recordingStream} />

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red" aria-hidden="true" />
          <span className="text-xs font-medium tracking-[0.15em] text-red uppercase">
            Recording
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecordingScreen;
