import ScreenActions from "@/components/ScreenActions";

type ErrorScreenProps = {
  message: string;
  canRetry: boolean;
  onRetry: () => void;
  onReRecord: () => void;
};

const ErrorScreen = ({
  message,
  canRetry,
  onRetry,
  onReRecord,
}: ErrorScreenProps) => {
  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-error-bg"
          aria-hidden="true"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="text-red"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-text">
          Something went wrong
        </h2>

        <p className="max-w-[280px] text-sm leading-relaxed text-muted">
          {message}
        </p>
      </div>

      <ScreenActions
        leftLabel="Re-record"
        rightLabel="Try again"
        onLeft={onReRecord}
        onRight={onRetry}
        rightDisabled={!canRetry}
      />
    </div>
  );
};

export default ErrorScreen;
