import CaptureHeader from "@/components/layout/CaptureHeader";
import AudioPlayer from "@/components/AudioPlayer";
import Card from "@/components/ui/Card";
import ScreenActions from "@/components/ScreenActions";
import { appShellClass } from "@/lib/layout/shell";

type PlaybackScreenProps = {
  audioUrl: string;
  durationSeconds: number;
  onReRecord: () => void;
  onConfirm: () => void;
};

const PlaybackScreen = ({
  audioUrl,
  durationSeconds,
  onReRecord,
  onConfirm,
}: PlaybackScreenProps) => (
  <div
    className={`${appShellClass} animate-fade-in min-h-[calc(100dvh-4.5rem)]`}
  >
    <CaptureHeader />
    <div className="flex flex-1 flex-col justify-center">
      <p className="type-eyebrow mb-4 text-center">Review your recording</p>
      <Card>
        <AudioPlayer audioUrl={audioUrl} durationSeconds={durationSeconds} />
      </Card>
    </div>

    <ScreenActions
      leftLabel="Re-record"
      rightLabel="Confirm →"
      onLeft={onReRecord}
      onRight={onConfirm}
    />
  </div>
);

export default PlaybackScreen;
