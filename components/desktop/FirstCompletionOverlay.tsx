"use client";

import Button from "@/components/ui/Button";
import { IconCheck } from "@/components/icons/ListenerIcons";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";

type FirstCompletionOverlayProps = {
  onDismiss: () => void;
};

/** Single-purpose first-done acknowledgement. No form, no permission, no project. */
const FirstCompletionOverlay = ({ onDismiss }: FirstCompletionOverlayProps) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
    <button
      type="button"
      aria-label={copy.success.celebrationDismiss}
      className="absolute inset-0 cursor-default bg-[var(--scrim)]"
      onClick={onDismiss}
    />
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-completion-title"
      className={`${ui.card} relative w-full max-w-[400px] px-8 pt-9 pb-8 text-center`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-10">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-white">
          <IconCheck size={18} strokeWidth={2.2} />
        </span>
      </div>
      <h2
        id="first-completion-title"
        className="mt-5 font-serif text-[28px] leading-tight tracking-[-0.01em] text-text"
      >
        {copy.success.ideaReady}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {copy.success.celebrationBody}
      </p>
      <Button className="mt-7" onClick={onDismiss}>
        {copy.success.celebrationDismiss}
      </Button>
    </div>
  </div>
);

export default FirstCompletionOverlay;
