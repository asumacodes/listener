import AppHeader from "@/components/AppHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { stageLabel } from "@/types/pipeline";
import type { PipelineStage } from "@/types/pipeline";

type PipelineRunningScreenProps = {
  pipelineStage: PipelineStage | null;
  runId: string | null;
};

const PipelineRunningScreen = ({
  pipelineStage,
  runId,
}: PipelineRunningScreenProps) => {
  const stageText = pipelineStage
    ? stageLabel(pipelineStage)
    : "Starting pipeline";

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <AppHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <LoadingSpinner />
        <div>
          <p className="text-base text-text">Pipeline running</p>
          <p className="mt-2 font-serif text-2xl capitalize text-text">
            {stageText}
          </p>
        </div>
        {runId && (
          <p className="text-[11px] tracking-wide text-text-secondary uppercase">
            Run {runId.slice(0, 8)}
          </p>
        )}
      </div>
    </div>
  );
};

export default PipelineRunningScreen;
