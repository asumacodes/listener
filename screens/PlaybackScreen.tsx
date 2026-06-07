import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import PlayerCard from "@/components/capture/PlayerCard";
import CtaBar from "@/components/ui/CtaBar";
import Button from "@/components/ui/Button";
import { ui } from "@/lib/design/ui";
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
    className={`${appShellClass} animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col`}
  >
    <FlowWordmarkHeader />
    <div className="flex flex-1 flex-col px-6">
      <p className={`${ui.eyebrow} mb-6 text-center`}>Review your recording</p>
      <div className="flex flex-1 items-center justify-center">
        <PlayerCard audioUrl={audioUrl} durationSeconds={durationSeconds} />
      </div>
    </div>
    <CtaBar className="px-6">
      <Button variant="secondary" fullWidth onClick={onReRecord}>
        Re-record
      </Button>
      <Button fullWidth onClick={onConfirm}>
        Confirm →
      </Button>
    </CtaBar>
  </div>
);

export default PlaybackScreen;
