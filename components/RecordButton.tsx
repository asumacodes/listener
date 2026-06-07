type RecordButtonProps = {
  mode: "idle" | "recording";
  onClick: () => void;
};

const MicIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="9"
      y="2"
      width="6"
      height="12"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M5 10a7 7 0 0 0 14 0"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M12 17v4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const StopIcon = () => (
  <span
    className="block h-[34px] w-[34px] rounded-[9px] bg-red"
    aria-hidden="true"
  />
);

const RecordButton = ({ mode, onClick }: RecordButtonProps) => {
  const isRecording = mode === "recording";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      aria-pressed={isRecording}
      className={`relative flex h-[120px] w-[120px] items-center justify-center rounded-full border bg-surface shadow-record transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-30)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.975] motion-reduce:active:scale-100 ${
        isRecording
          ? "border-red text-red"
          : "animate-idle-breathe border-gold text-gold"
      }`}
    >
      {isRecording ? (
        <span
          className="pointer-events-none absolute inset-[-6px] rounded-full border-2 border-red animate-record-pulse-ring motion-reduce:hidden"
          aria-hidden
        />
      ) : null}
      {isRecording ? <StopIcon /> : <MicIcon />}
    </button>
  );
};

export default RecordButton;
