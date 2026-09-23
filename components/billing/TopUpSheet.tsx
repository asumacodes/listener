"use client";

import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";
import type { TopUpOption } from "@/lib/billing/planView";
import { useState } from "react";

type TopUpSheetProps = {
  open: boolean;
  options: TopUpOption[];
  busy?: boolean;
  onConfirm: (option: TopUpOption) => void;
  onClose: () => void;
};

/**
 * Extra ideas — the only purchase that never expires. One SKU per account
 * today (tier top-up for subscribers, pay-as-you-go otherwise); the list keeps
 * room for more without a second layout.
 */
const TopUpSheet = ({
  open,
  options,
  busy = false,
  onConfirm,
  onClose,
}: TopUpSheetProps) => {
  const [pickedId, setPickedId] = useState<string | null>(null);
  // Derived, not synced: if the SKU list changes under us (tier switch), the
  // first option takes over without an effect.
  const selected =
    options.find((option) => option.id === pickedId) ?? options[0] ?? null;
  const payg =
    options.length > 0 && options.every((option) => option.intent === "payg");
  const sheetCopy = payg ? copy.plan.paygSheet : copy.plan.topUpSheet;

  return (
    <BottomSheet open={open} onClose={onClose} lockDismiss={busy}>
      <div
        role="dialog"
        aria-labelledby="top-up-title"
        className="flex flex-col gap-4"
      >
        <div>
          <h2
            id="top-up-title"
            className="font-serif text-2xl leading-tight text-text"
          >
            {sheetCopy.title}
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">
            {sheetCopy.lead}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {options.map((option) => {
            const active = option.id === selected?.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPickedId(option.id)}
                className={`flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition ${
                  active
                    ? "border-gold bg-gold-10"
                    : "border-border bg-surface hover:bg-black/[0.02]"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                    active ? "border-gold" : "border-dashed-border"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${active ? "bg-gold" : "bg-transparent"}`}
                  />
                </span>
                <span className="flex-1 text-[15px] font-medium text-text">
                  {option.label}
                </span>
                <span className="text-[15px] text-text-secondary">
                  {option.price}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            fullWidth
            disabled={busy || !selected}
            onClick={() => {
              if (selected) onConfirm(selected);
            }}
          >
            {copy.plan.topUpSheet.cta}
          </Button>
          <p className="text-center text-xs text-muted">
            {copy.checkout.statement}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
};

export default TopUpSheet;
