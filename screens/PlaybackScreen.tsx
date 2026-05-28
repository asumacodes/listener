import AudioPlayer from "@/components/AudioPlayer";
import Card from "@/components/ui/Card";
import ScreenActions from "@/components/ScreenActions";

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
}: PlaybackScreenProps) => {
  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <div className="flex flex-1 flex-col justify-center">
        <p className="mb-4 text-center text-[11px] tracking-[0.2em] text-muted uppercase">
          Review your recording
        </p>

        <Card>
          <AudioPlayer audioUrl={audioUrl} durationSeconds={durationSeconds} />
        </Card>
      </div>

      <ScreenActions
        leftLabel="Re-record"
        rightLabel="Confirm"
        onLeft={onReRecord}
        onRight={onConfirm}
      />
    </div>
  );
};

export default PlaybackScreen;
