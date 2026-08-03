"use client";

import { M1_CARDS } from "@/lib/ideas/cards";
import type { M1CardId } from "@/types/ideas";
import { PIPELINE_CARD_META } from "@/lib/pipeline/cards";

export type ArtifactIndexItemState =
  | "done"
  | "active"
  | "pending"
  | "failed"
  | "link-out";

type ArtifactIndexItemProps = {
  id: M1CardId;
  state: ArtifactIndexItemState;
  selected: boolean;
  onSelect: () => void;
  /** Live label override e.g. Writing */
  liveLabel?: string;
};

const ArtifactIndexItem = ({
  id,
  state,
  selected,
  onSelect,
  liveLabel,
}: ArtifactIndexItemProps) => {
  const meta = M1_CARDS[id];
  const isLinkOut = PIPELINE_CARD_META[id]?.kind === "linkout";
  const pending = state === "pending";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-[42px] w-full items-center gap-[11px] rounded-xl px-3.5 text-left text-[13px] transition ${
        selected
          ? "bg-gold-10 font-semibold text-text"
          : pending
            ? "border border-dashed border-dashed-border text-muted"
            : "text-text-secondary hover:bg-black/[0.02]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          state === "done" || state === "active"
            ? selected
              ? "bg-gold-deep"
              : "bg-gold"
            : state === "failed"
              ? "bg-red"
              : "border border-border bg-transparent"
        } ${state === "active" ? "animate-pulse" : ""}`}
      />
      <span className="min-w-0 flex-1 truncate">{meta.title}</span>
      {state === "active" && liveLabel ? (
        <span className="text-[10px] font-medium tracking-[0.12em] text-gold-deep uppercase">
          {liveLabel}
        </span>
      ) : null}
      {state === "failed" && liveLabel ? (
        <span
          className={`text-[11px] font-medium ${
            liveLabel === "Try again" ? "text-red" : "text-muted"
          }`}
        >
          {liveLabel}
        </span>
      ) : null}
      {isLinkOut || state === "link-out" ? (
        <span className="rounded-md border border-border px-1.5 py-0.5 text-[8px] font-medium tracking-[0.1em] text-muted uppercase">
          Link
        </span>
      ) : null}
      {selected && state !== "failed" ? (
        <span className="text-[11px] text-gold-deep">→</span>
      ) : null}
    </button>
  );
};

export default ArtifactIndexItem;
