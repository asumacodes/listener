import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import RecordButton from "@/components/RecordButton";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { formatTime } from "@/lib/format";
import { appShellClass } from "@/lib/layout/shell";
import { MAX_RECORDING_SECONDS } from "@/lib/media/recorder";

interface RecordingScreenProps {
  elapsedSeconds: number;
  recordingStream: MediaStream | null;
  onStop: () => void;
}

/** Mockup recording — bare wordmark, timer, rec pill. */
const RecordingScreen = ({
  elapsedSeconds,
  recordingStream,
  onStop,
}: RecordingScreenProps) => {
  const nearCap = elapsedSeconds >= MAX_RECORDING_SECONDS - 30;

  return (
    <div
      className={`${appShellClass} animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col`}
    >
      <FlowWordmarkHeader />

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <RecordButton mode="recording" onClick={onStop} />
        <div className="flex flex-col items-center gap-2">
          <p className="font-serif text-5xl tracking-tight text-text">
            {formatTime(elapsedSeconds)}
          </p>
          <div className="inline-flex items-center gap-[7px] rounded-full border border-red/20 bg-error-surface px-[13px] py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-red">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
            Recording
          </div>
          {nearCap ? (
            <p className="text-xs text-muted">
              {formatTime(MAX_RECORDING_SECONDS)} max
            </p>
          ) : null}
        </div>
        <WaveformVisualizer stream={recordingStream} />
      </div>
    </div>
  );
};

export default RecordingScreen;
