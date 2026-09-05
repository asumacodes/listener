"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useState } from "react";

type FrictionPromptProps = {
  busy: boolean;
  error: string | null;
  onSubmit: (response: string) => void;
  onDismiss: () => void;
};

const FrictionPrompt = ({
  busy,
  error,
  onSubmit,
  onDismiss,
}: FrictionPromptProps) => {
  const [response, setResponse] = useState("");
  const trimmed = response.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= 4000 && !busy;

  return (
    <div
      role="region"
      aria-label={copy.friction.question}
      className={ui.cardFlat}
    >
      <form
        className="px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) onSubmit(trimmed);
        }}
      >
        <label
          htmlFor="friction-response"
          className="font-serif text-[18px] leading-tight tracking-[-0.01em] text-text"
        >
          {copy.friction.question}
        </label>
        <Input
          id="friction-response"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={busy}
          maxLength={4000}
          placeholder={copy.friction.placeholder}
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
            onClick={onDismiss}
            disabled={busy}
            className={ui.textLink}
          >
            {copy.friction.notNow}
          </button>
          <Button
            type="submit"
            disabled={!canSave}
            className="!min-h-[42px] px-5 text-sm"
          >
            {copy.friction.save}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FrictionPrompt;
