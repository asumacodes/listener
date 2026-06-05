import AppHeader from "@/components/AppHeader";
import Button from "@/components/ui/Button";
import Link from "next/link";

type PipelineDoneScreenProps = {
  runId: string | null;
  onNewRecording: () => void;
};

const PipelineDoneScreen = ({
  runId,
  onNewRecording,
}: PipelineDoneScreenProps) => {
  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <AppHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h2 className="font-serif text-3xl text-text">Pipeline complete</h2>
        <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
          Your voice note has been processed. Head to your projects to review
          what was created.
        </p>
        {runId && (
          <p className="text-[11px] tracking-wide text-text-secondary uppercase">
            Run {runId.slice(0, 8)}
          </p>
        )}
        <div className="mt-4 flex w-full max-w-sm flex-col gap-3">
          <Link href="/projects">
            <Button fullWidth>Go to projects</Button>
          </Link>
          <Button variant="secondary" fullWidth onClick={onNewRecording}>
            New recording
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PipelineDoneScreen;
