"use client";

import { IconChevron } from "@/components/icons/ListenerIcons";
import { M1_CARDS, type M1CardMeta } from "@/lib/ideas/cards";
import type { M1CardId, M1CardState } from "@/types/ideas";
import { useState } from "react";

type M1CardProps = {
  id: M1CardId;
  state: M1CardState;
  defaultOpen?: boolean;
};

const M1Card = ({ id, state, defaultOpen = false }: M1CardProps) => {
  const card: M1CardMeta = M1_CARDS[id];
  const [open, setOpen] = useState(defaultOpen);

  if (state === "pending") {
    return (
      <div className="m1-card pending rounded-2xl border border-dashed border-[#E4E2DC] px-[18px] py-[15px]">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-muted">{card.title}</span>
          <span className="text-[11px] tracking-wide text-muted uppercase">
            {card.stageLabel}
          </span>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="m1-card loading rounded-2xl border border-border bg-surface p-[18px] shadow-card">
        <p className="text-center text-sm text-text-secondary">
          Building {card.title.toLowerCase()}…
        </p>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="m1-card failed rounded-2xl border border-[#E8545440] bg-error-surface p-[18px]">
        <p className="font-medium text-text">{card.title}</p>
        <p className="mt-2 text-sm text-text-secondary">
          We couldn&apos;t finish this step.
        </p>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="m1-card rounded-2xl border border-border bg-surface p-[18px] shadow-card">
        <p className="font-medium text-text">{card.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {card.emptyCopy ?? "Not available yet for this idea."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`m1-card rounded-2xl border border-border bg-surface shadow-card ${open ? "open" : ""}`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-[18px] py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-text">{card.title}</span>
        <IconChevron
          size={18}
          className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="border-t border-border px-[18px] py-4 text-sm leading-relaxed text-text-secondary">
          Content will appear here once pipeline results are saved.
        </div>
      ) : null}
    </div>
  );
};

export default M1Card;
