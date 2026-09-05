"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useState } from "react";

type PostDeliveryPromptProps = {
  phase: "reaction" | "note";
  busy: boolean;
  error: string | null;
  onReact: (reaction: "up" | "down") => void;
  onSubmitNote: (note: string) => void;
  onSkipNote: () => void;
  onDismiss: () => void;
};

const PostDeliveryPrompt = ({
  phase,
  busy,
  error,
  onReact,
  onSubmitNote,
  onSkipNote,
  onDismiss,
}: PostDeliveryPromptProps) => {
  const [note, setNote] = useState("");
  const trimmed = note.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= 4000 && !busy;

  return (
    <div
      role="region"
      aria-label={
        phase === "note" ? copy.postDelivery.beat2 : copy.postDelivery.beat1
      }
      className={ui.cardFlat}
    >
      {phase === "reaction" ? (
        <div className="px-5 py-4">
          <p className="font-serif text-[18px] leading-tight tracking-[-0.01em] text-text">
            {copy.postDelivery.beat1}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              aria-label={copy.postDelivery.yes}
              disabled={busy}
              onClick={() => onReact("up")}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-border px-2 py-3 text-2xl transition hover:border-text-secondary disabled:opacity-50"
            >
              <span aria-hidden>👍</span>
              <span className="text-[11px] font-medium text-text-secondary">
                {copy.postDelivery.yes}
              </span>
            </button>
            <button
              type="button"
              aria-label={copy.postDelivery.notReally}
              disabled={busy}
              onClick={() => onReact("down")}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-border px-2 py-3 text-2xl transition hover:border-text-secondary disabled:opacity-50"
            >
              <span aria-hidden>👎</span>
              <span className="text-[11px] font-medium text-text-secondary">
                {copy.postDelivery.notReally}
              </span>
            </button>
          </div>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-red">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            disabled={busy}
            className={`${ui.textLink} mt-3`}
          >
            {copy.postDelivery.notNow}
          </button>
        </div>
      ) : (
        <form
          className="px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) onSubmitNote(trimmed);
          }}
        >
          <label
            htmlFor="post-delivery-note"
            className="font-serif text-[18px] leading-tight tracking-[-0.01em] text-text"
          >
            {copy.postDelivery.beat2}
          </label>
          <Input
            id="post-delivery-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
            maxLength={4000}
            placeholder={copy.postDelivery.placeholder}
            className="mt-4"
          />
          {error ? (
            <p role="alert" className="mt-3 text-sm text-red">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onSkipNote}
              disabled={busy}
              className={ui.textLink}
            >
              {copy.postDelivery.skip}
            </button>
            <Button
              type="submit"
              disabled={!canSave}
              className="!min-h-[42px] px-5 text-sm"
            >
              {copy.postDelivery.save}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PostDeliveryPrompt;
