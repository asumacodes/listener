"use client";

import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useState } from "react";

type ShipOutcomePromptProps = {
  busy: boolean;
  error: string | null;
  onSubmit: (args: {
    shippedWhat: string;
    liveProductUrl: string | null;
    publicConsent: boolean;
  }) => void;
};

const ShipOutcomePrompt = ({
  busy,
  error,
  onSubmit,
}: ShipOutcomePromptProps) => {
  const [phase, setPhase] = useState<"outcome" | "consent">("outcome");
  const [shippedWhat, setShippedWhat] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const trimmed = shippedWhat.trim();
  const urlTrimmed = liveUrl.trim();
  const canContinue = trimmed.length > 0 && trimmed.length <= 4000 && !busy;

  return (
    <div
      role="region"
      aria-label={
        phase === "consent"
          ? copy.shipOutcome.consentQuestion
          : copy.shipOutcome.question
      }
      className={ui.cardFlat}
    >
      {phase === "outcome" ? (
        <form
          className="px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canContinue) setPhase("consent");
          }}
        >
          <label
            htmlFor="ship-outcome-what"
            className="font-serif text-[18px] leading-tight tracking-[-0.01em] text-text"
          >
            {copy.shipOutcome.question}
          </label>
          <Input
            id="ship-outcome-what"
            value={shippedWhat}
            onChange={(e) => setShippedWhat(e.target.value)}
            disabled={busy}
            maxLength={4000}
            placeholder={copy.shipOutcome.placeholder}
            className="mt-4"
          />
          <FieldLabel htmlFor="ship-outcome-url" className="mt-4">
            {copy.shipOutcome.urlLabel}
          </FieldLabel>
          <Input
            id="ship-outcome-url"
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            disabled={busy}
            placeholder={copy.shipOutcome.urlPlaceholder}
            className="mt-1.5"
          />
          {error ? (
            <p role="alert" className="mt-3 text-sm text-red">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex items-center justify-end">
            <Button
              type="submit"
              disabled={!canContinue}
              className="!min-h-[42px] px-5 text-sm"
            >
              {copy.shipOutcome.continue}
            </Button>
          </div>
        </form>
      ) : (
        <div className="px-5 py-4">
          <p className="font-serif text-[18px] leading-tight tracking-[-0.01em] text-text">
            {copy.shipOutcome.consentQuestion}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
            {copy.shipOutcome.consentLead}
          </p>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-red">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              disabled={busy}
              className="flex-1 !min-h-[42px] text-sm"
              onClick={() =>
                onSubmit({
                  shippedWhat: trimmed,
                  liveProductUrl: urlTrimmed === "" ? null : urlTrimmed,
                  publicConsent: true,
                })
              }
            >
              {copy.shipOutcome.consentYes}
            </Button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onSubmit({
                  shippedWhat: trimmed,
                  liveProductUrl: urlTrimmed === "" ? null : urlTrimmed,
                  publicConsent: false,
                })
              }
              className="flex flex-1 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-text transition hover:border-text-secondary disabled:opacity-50"
            >
              {copy.shipOutcome.consentNo}
            </button>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPhase("outcome")}
            className={`${ui.textLink} mt-3`}
          >
            {copy.shipOutcome.back}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShipOutcomePrompt;
