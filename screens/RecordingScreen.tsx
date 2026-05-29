import AppHeader from "@/components/AppHeader";
import RecordButton from "@/components/RecordButton";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { formatTime } from "@/lib/format";

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
      <AppHeader isRecording />

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
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
