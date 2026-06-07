import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import ScreenActions from "@/components/ScreenActions";
import { copy } from "@/lib/design/copy";
import { appShellClass } from "@/lib/layout/shell";

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
}: ErrorScreenProps) => (
  <div
    className={`${appShellClass} animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col`}
  >
    <FlowWordmarkHeader />
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-error-surface"
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

      <h2 className="font-serif text-2xl text-text">Something went wrong</h2>

      <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
        {message}
      </p>
    </div>

    <ScreenActions
      leftLabel={copy.mic.dismiss}
      rightLabel="Retry"
      onLeft={onReRecord}
      onRight={onRetry}
      rightDisabled={!canRetry}
    />
  </div>
);

export default ErrorScreen;
