import AppHeader from "@/components/AppHeader";
import RecordButton from "@/components/RecordButton";

const IdleScreen = ({ onRecord }: { onRecord: () => void }) => {
  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <AppHeader />

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <RecordButton mode="idle" onClick={onRecord} />
        <p className="text-sm text-muted">Tap to record</p>
      </div>

      <p className="pb-4 text-center text-[11px] tracking-[0.2em] text-text-secondary uppercase">
        Speak · Transcribe · Ship
      </p>
    </div>
  );
};

export default IdleScreen;
