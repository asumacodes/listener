import { IconMic } from "@/components/icons/ListenerIcons";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";

type NoSpeechScreenProps = {
  onRecordAgain: () => void;
  onDismiss: () => void;
};

/** Transcription heard nothing — re-record only; no transcript, no pipeline CTA. */
const NoSpeechScreen = ({ onRecordAgain, onDismiss }: NoSpeechScreenProps) => (
  <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto bg-canvas px-6 py-6">
    <div className="mx-auto flex w-full max-w-[300px] flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-surface text-red shadow-[0_0_0_6px_#FDECEC80]">
        <IconMic size={28} />
      </div>

      <h1 className="mb-3 font-serif text-[27px] leading-[1.1] tracking-[-0.01em] text-text">
        {copy.noSpeech.title}
      </h1>

      <p className="mb-7 max-w-[32ch] text-sm leading-relaxed text-text-secondary">
        {copy.noSpeech.body}
      </p>

      <div className="flex w-full flex-col items-center gap-2">
        <Button variant="primary" fullWidth onClick={onRecordAgain}>
          {copy.noSpeech.recordAgain}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="cursor-pointer border-0 bg-transparent px-2 py-1 font-sans text-sm font-medium text-muted"
        >
          {copy.noSpeech.dismiss}
        </button>
      </div>
    </div>
  </div>
);

export default NoSpeechScreen;
