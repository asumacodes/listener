import AppHeader from "@/components/AppHeader";
import Button from "@/components/ui/Button";
import type { HandoffReason } from "@/types/pipeline";

type PipelineFailedScreenProps = {
  handoffReason: HandoffReason | null;
  pipelineError: string | null;
  runId: string | null;
  onRetry: () => void;
  onNewRecording: () => void;
};

const reasonCopy: Partial<Record<HandoffReason, string>> = {
  invalid_signature: "Bridge rejected the signature. Check server secrets.",
  minutes_exhausted: "Free-tier minutes are exhausted.",
  bad_response: "Bridge returned an unexpected response.",
  unreachable: "Could not reach the Bridge webhook.",
  create_failed: "Could not create the pipeline run row.",
  handoff_failed: "Handoff to Bridge failed. You can retry.",
  not_retryable:
    "This run is no longer retryable — it may already be in progress.",
  recording_unavailable: "Could not load the recording audio.",
};

const PipelineFailedScreen = ({
  handoffReason,
  pipelineError,
  runId,
  onRetry,
  onNewRecording,
}: PipelineFailedScreenProps) => {
  const message =
    pipelineError ??
    (handoffReason ? reasonCopy[handoffReason] : "Pipeline handoff failed.");

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <AppHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <h2 className="text-lg font-semibold text-text">Pipeline failed</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{message}</p>
        {runId && (
          <p className="text-[11px] tracking-wide text-text-secondary uppercase">
            Run {runId.slice(0, 8)} · recoverable
          </p>
        )}
      </div>
      <div className="flex gap-3 px-4 pb-8">
        <Button variant="secondary" fullWidth onClick={onNewRecording}>
          New recording
        </Button>
        <Button fullWidth onClick={onRetry} disabled={!runId}>
          Retry handoff
        </Button>
      </div>
    </div>
  );
};

export default PipelineFailedScreen;
