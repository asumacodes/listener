import CaptureHeader from "@/components/layout/CaptureHeader";
import ScreenActions from "@/components/ScreenActions";
import { copy } from "@/lib/design/copy";
import { appShellClass } from "@/lib/layout/shell";

type ErrorScreenProps = {
  message: string;
  canRetry: boolean;
  onRetry: () => void;
  onReRecord: () => void;
};

const isMicError = (message: string) =>
  /microphone|mic|permission|notallowed/i.test(message);

const ErrorScreen = ({
  message,
  canRetry,
  onRetry,
  onReRecord,
}: ErrorScreenProps) => {
  const micDenied = isMicError(message);

  return (
    <div
      className={`${appShellClass} animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col`}
    >
      <CaptureHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-error-bg"
          aria-hidden
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

        <h2 className="font-serif text-2xl text-text">
          {micDenied ? copy.mic.title : "Something went wrong"}
        </h2>

        <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
          {micDenied ? copy.mic.body : message}
        </p>
      </div>

      <ScreenActions
        leftLabel="Re-record"
        rightLabel={micDenied ? "Try again" : "Retry"}
        onLeft={onReRecord}
        onRight={onRetry}
        rightDisabled={!canRetry && !micDenied}
      />
    </div>
  );
};

export default ErrorScreen;
