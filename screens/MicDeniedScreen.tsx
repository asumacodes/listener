import { IconMicOff } from "@/components/icons/ListenerIcons";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";

type MicDeniedScreenProps = {
  onTryAgain: () => void;
  onDismiss: () => void;
};

/** Mockup `MicDeniedScreen` — centered error pattern for mic permission. */
const MicDeniedScreen = ({ onTryAgain, onDismiss }: MicDeniedScreenProps) => (
  <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto bg-canvas px-6 py-6">
    <div className="mx-auto flex w-full max-w-[300px] flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-surface text-red shadow-[0_0_0_6px_#FDECEC80]">
        <IconMicOff size={28} />
      </div>

      <h1 className="mb-3 font-serif text-[27px] leading-[1.1] tracking-[-0.01em] text-text">
        {copy.mic.title}
      </h1>

      <p className="mb-7 max-w-[32ch] text-sm leading-relaxed text-text-secondary">
        {copy.mic.body}
      </p>

      <div className="flex w-full flex-col items-center gap-2">
        <Button variant="primary" fullWidth onClick={onTryAgain}>
          {copy.mic.tryAgain}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="cursor-pointer border-0 bg-transparent px-2 py-1 font-sans text-sm font-medium text-muted"
        >
          {copy.mic.dismiss}
        </button>
      </div>
    </div>
  </div>
);

export default MicDeniedScreen;
