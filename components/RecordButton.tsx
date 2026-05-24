type RecordButtonProps = {
  mode: "idle" | "recording";
  onClick: () => void;
};

const MicIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
    <path
      d="M6 11a6 6 0 0012 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="17"
      x2="12"
      y2="21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="9"
      y1="21"
      x2="15"
      y2="21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const StopIcon = () => (
  <span
    className="block h-7 w-7 rounded-sm bg-recording-red"
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
      className={`flex h-[120px] w-[120px] items-center justify-center rounded-full border-[3px] border-gold-primary bg-card-white text-gold-primary transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-cream ${
        isRecording ? "animate-record-pulse" : "animate-idle-breathe"
      }`}
    >
      {isRecording ? <StopIcon /> : <MicIcon />}
    </button>
  );
};

export default RecordButton;
