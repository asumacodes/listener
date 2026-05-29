import AppHeader from "@/components/AppHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const SubmittingScreen = () => {
  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <AppHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <LoadingSpinner />
        <p className="text-base text-text">Transcribing your idea...</p>
        <p className="text-[11px] tracking-[0.2em] text-text-secondary uppercase">
          Local AI · Private · Fast
        </p>
      </div>
    </div>
  );
};

export default SubmittingScreen;
