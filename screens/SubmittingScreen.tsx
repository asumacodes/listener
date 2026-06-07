import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import AuthSpinner from "@/components/auth/AuthSpinner";
import { appShellClass } from "@/lib/layout/shell";

/** Transcribe + save — after Confirm, before Transcript review. */
const SubmittingScreen = () => (
  <div className={`${appShellClass} flex min-h-[calc(100dvh-4.5rem)] flex-col`}>
    <FlowWordmarkHeader />
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <AuthSpinner />
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
        Transcribing your recording…
      </p>
    </div>
  </div>
);

export default SubmittingScreen;
